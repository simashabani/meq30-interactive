"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import MEQ30Form, { MEQAnswersMap } from "@/components/MEQ30Form";
import { scoreMEQ30 } from "@/lib/meq30Score";
import { MEQ30_QUESTIONS } from "@/lib/meq30Questions";

export default function NewExperiencePage() {
  const [email, setEmail] = useState<string | null>(null);

  // Experience metadata
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(""); // "" means not set
  const [notes, setNotes] = useState("");

  // Answers map: canonicalId (string) -> 0..5
  const [answers, setAnswers] = React.useState<MEQAnswersMap>({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/en/login";
      } else {
        setEmail(data.user.email);
      }
    });
  }, []);

  if (!email) return <p>Loading...</p>;

  const answeredCount = Object.keys(answers).length;
  const canSave = title.trim().length > 0 && answeredCount === 30;

  function autofillAll(value: number) {
    const filled: MEQAnswersMap = {};
    for (const q of MEQ30_QUESTIONS) {
      filled[String(q.canonicalId)] = value;
    }
    setAnswers(filled);
  }

  async function handleSave() {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      // Re-check auth before writing
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        window.location.href = "/en/login";
        return;
      }

      const occurred_at = date ? new Date(date).toISOString() : null;

      // 1) Insert experience (include user_id to satisfy RLS)
      const { data: exp, error: expErr } = await supabase
        .from("experiences")
        .insert({
          user_id: userData.user.id,
          title: title.trim(),
          occurred_at,
          notes: notes.trim() || null,
          is_shared_for_research: false,
        })
        .select("id")
        .single();

      if (expErr) throw expErr;

      // 2) Score
      const scores = scoreMEQ30(answers);

      // 3) Insert MEQ response
      const { error: respErr } = await supabase.from("meq30_responses").insert({
        experience_id: exp.id,
        answers,
        overall_mean: scores.overall_mean,
        mystical_mean: scores.mystical_mean,
        positive_mood_mean: scores.positive_mood_mean,
        transcendence_mean: scores.transcendence_mean,
        ineffability_mean: scores.ineffability_mean,
        complete_mystical: scores.complete_mystical,
        interpretation_key: "pending_v1",
        interpretation_en: null,
        interpretation_fa: null,
      });

      if (respErr) throw respErr;

      window.location.href = "/en/journal";
    } catch (e: any) {
      alert("Save failed: " + (e?.message ?? String(e)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Experience</h1>
        <Link href="/en/journal" className="text-sm underline">
          ← Back to Journal
        </Link>
      </div>

      {/* Experience metadata */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title (required)</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            placeholder="e.g., Mountain sunset meditation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Date (optional)</label>
          <input
            className="border rounded px-3 py-2"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Any context you want to remember..."
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Test helpers */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            className="px-3 py-2 rounded border text-sm"
            onClick={() => autofillAll(3)}
          >
            Test: Fill all = 3 (moderate)
          </button>

          <button
            type="button"
            className="px-3 py-2 rounded border text-sm"
            onClick={() => setAnswers({})}
          >
            Clear answers
          </button>
        </div>
      </div>

      {/* Progress */}
      <p className="text-sm">
        Answered: <b>{answeredCount}</b> / 30
      </p>

      {/* MEQ form */}
      <MEQ30Form lang="en" value={answers} onChange={setAnswers} />

      {/* Save */}
      <button
        className="mt-6 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={!canSave || saving}
        onClick={handleSave}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </main>
  );
}
