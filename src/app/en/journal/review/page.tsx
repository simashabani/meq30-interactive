"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// removed: import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  savePendingExperience,
  PendingExperience,
} from "@/lib/pendingExperience";
import { generateMeq30Interpretation } from "@/lib/interpretation/generateMeq30Interpretation";

type ReviewExperience = PendingExperience & {
  language: "en" | "fa";
};

export default function ReviewPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [pending, setPending] = useState<ReviewExperience | null>(null);
  // removed:
  // const searchParams = useSearchParams();
  // const experienceId = searchParams.get("id");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const experienceId = new URLSearchParams(window.location.search).get("id");

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        window.location.href = "/en/login";
        return;
      }

      setEmail(data.user.email ?? null);

      if (experienceId) {
        const { data: expData, error: expErr } = await supabase
          .from("experiences")
          .select("id,title,occurred_at,notes")
          .eq("id", experienceId)
          .single();

        if (expErr || !expData) {
          alert("Failed to load experience.");
          window.location.href = "/en/journal";
          return;
        }

        const { data: respData, error: respErr } = await supabase
          .from("meq30_responses")
          .select(
            "language,answers,mystical_percentage,positive_mood_percentage,time_space_percentage,ineffability_percentage,complete_mystical"
          )
          .eq("experience_id", experienceId)
          .single();

        if (respErr || !respData) {
          alert("No MEQ response found for this experience.");
          window.location.href = "/en/journal";
          return;
        }

        setPending({
          experienceId,
          title: expData.title ?? "",
          date: expData.occurred_at
            ? new Date(expData.occurred_at).toISOString().slice(0, 10)
            : "",
          notes: expData.notes ?? "",
          answers: respData.answers ?? {},
          scores: {
            mystical_percentage: respData.mystical_percentage ?? 0,
            positive_mood_percentage: respData.positive_mood_percentage ?? 0,
            time_space_percentage: respData.time_space_percentage ?? 0,
            ineffability_percentage: respData.ineffability_percentage ?? 0,
            complete_mystical: respData.complete_mystical ?? false,
          },
          language: respData.language === "fa" ? "fa" : "en",
          isDirty: false,
        });
        return;
      }

      window.location.href = "/en/journal/new";
    });
  }, []);

  if (!email || !pending) return <p>Loading...</p>;

  const interpretation = generateMeq30Interpretation(
    pending.scores,
    pending.language
  );
  const answeredCount = pending.answers ? Object.keys(pending.answers).length : 0;
  const isCompleteResponse = answeredCount === 30;
  const interpretationParagraph = isCompleteResponse
    ? interpretation.paragraph
    : "Not all MEQ-30 questions were answered, so the mystical result is currently inconclusive.";

  async function handleEditSaved() {
    if (!pending) return;
    savePendingExperience({
      experienceId: pending.experienceId,
      title: pending.title,
      date: pending.date,
      notes: pending.notes,
      answers: pending.answers,
      scores: pending.scores,
      isDirty: false,
    });
    window.location.href = "/en/journal/new?loadPending=1";
  }

  async function handleDeleteSaved() {
    if (!pending?.experienceId) return;
    if (!confirm("Delete this experience?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from("meq30_responses")
      .delete()
      .eq("experience_id", pending.experienceId);
    const { error } = await supabase
      .from("experiences")
      .delete()
      .eq("id", pending.experienceId);
    if (error) {
      alert("Failed to delete experience.");
      return;
    }
    window.location.href = "/en/journal";
  }

  return (
    <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)', marginTop: '-40px', marginBottom: '-40px', background: '#f8f8f6' }}>
    <main
      className="max-w-[900px] mx-auto px-6 space-y-6"
      style={{ paddingTop: "clamp(18px, 4vw, 38px)", paddingBottom: "clamp(18px, 4vw, 38px)" }}
    >
      <div className="main-page-row flex items-center justify-between">
        <h1 className="text-lg font-semibold">Review Experience</h1>
        <Link href="/en/journal" className="main-page-link-button">
          Back to Experience List
        </Link>
      </div>

      {/* Experience Details */}
      <div className="border p-4 space-y-4 bg-white">
        <div>
          <label className="text-sm font-medium">Title</label>
          <p className="text-lg">{pending.title}</p>
        </div>

        {pending.date && (
          <div>
            <label className="text-sm font-medium">Date</label>
            <p>
              {new Date(`${pending.date}T00:00:00Z`).toLocaleDateString(
                "en-US",
                { timeZone: "UTC" }
              )}
            </p>
          </div>
        )}

        {pending.notes && (
          <div>
            <label className="text-sm font-medium">Notes</label>
            <p className="whitespace-pre-wrap text-sm">{pending.notes}</p>
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="border p-4 space-y-4 bg-white">
        <h2 className="text-lg font-semibold">MEQ-30 Scores</h2>
        <p className="text-sm font-medium">
          {!isCompleteResponse
            ? "Inconclusive: not all questions were answered."
            : pending.scores.complete_mystical
            ? "Your experience is mystical."
            : "Your experience is not mystical."}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Mystical</label>
            <p className="text-xl font-bold">
              {pending.scores.mystical_percentage.toFixed(1)}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Positive Mood</label>
            <p className="text-xl font-bold">
              {pending.scores.positive_mood_percentage.toFixed(1)}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Time & Space</label>
            <p className="text-xl font-bold">
              {pending.scores.time_space_percentage.toFixed(1)}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Ineffability</label>
            <p className="text-xl font-bold">
              {pending.scores.ineffability_percentage.toFixed(1)}%
            </p>
          </div>

          {isCompleteResponse && pending.scores.complete_mystical && (
            <div className="col-span-2 bg-gray-100 border border-gray-300 p-3">
              <p className="text-sm font-medium text-gray-800">
                ✓ Complete Mystical Experience (all subscales ≥ 60%)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interpretation */}
      <div className="border p-4 space-y-3 bg-white">
        <h2 className="text-lg font-semibold">Interpretation</h2>
        <p className="text-sm leading-relaxed">{interpretationParagraph}</p>
      </div>

      <div className="main-page-row flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleEditSaved}
            className="px-4 py-2"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteSaved}
            className="px-4 py-2"
          >
            Delete
          </button>
        </div>
        <Link href="/en/journal" className="main-page-link-button">
          Back to Experience List
        </Link>
      </div>
    </main>
    </div>
  );
}
