import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { scoreMEQ30 } from "@/lib/meq30Score";
import { generateMeq30Interpretation } from "@/lib/interpretation/interpretation";

type SubmitBody = {
  title: string;
  date?: string; // ISO or ""
  notes?: string;
  answers: Record<string, number>;
  language: "en" | "fa";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubmitBody;

    if (!body?.title?.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!body?.answers) {
      return NextResponse.json({ error: "Answers are required." }, { status: 400 });
    }
    if (body.language !== "en" && body.language !== "fa") {
      return NextResponse.json({ error: "Invalid language." }, { status: 400 });
    }

    const supabase = await createSupabaseServer();

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const occurred_at =
      body.date && body.date.trim() ? new Date(body.date).toISOString() : null;

    // Source of truth: compute on server.
    const scores = scoreMEQ30(body.answers);

    const interpretation = generateMeq30Interpretation(scores, body.language);

    // 1) Insert experience.
    const { data: exp, error: expErr } = await supabase
      .from("experiences")
      .insert({
        user_id: userData.user.id,
        title: body.title.trim(),
        occurred_at,
        notes: body.notes?.trim() || null,
        is_shared_for_research: false
      })
      .select("id")
      .single();

    if (expErr) throw expErr;

    // 2) Insert meq30 response (store snapshot paragraph in correct column).
    const insertResponse: any = {
      experience_id: exp.id,
      language: body.language,
      answers: body.answers,

      mystical_percentage: scores.mystical_percentage,
      positive_mood_percentage: scores.positive_mood_percentage,
      time_space_percentage: scores.time_space_percentage,
      ineffability_percentage: scores.ineffability_percentage,
      complete_mystical: scores.complete_mystical,

      interpretation_key: interpretation.key,
      interpretation_version: interpretation.version,
      interpretation_en: body.language === "en" ? interpretation.paragraph : null,
      interpretation_fa: body.language === "fa" ? interpretation.paragraph : null
    };

    const { error: respErr } = await supabase
      .from("meq30_responses")
      .insert(insertResponse);

    if (respErr) throw respErr;

    return NextResponse.json({ ok: true, experienceId: exp.id });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
