"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  getPendingExperience,
  clearPendingExperience,
  PendingExperience,
} from "@/lib/pendingExperience";
import { generateMeq30Interpretation } from "@/lib/interpretation/generateMeq30Interpretation";

type ReviewExperience = PendingExperience & {
  language: "en" | "fa";
};

export default function ReviewPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [pending, setPending] = useState<ReviewExperience | null>(null);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<"pending" | "saved" | null>(null);
  const searchParams = useSearchParams();
  const experienceId = searchParams.get("id");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        window.location.href = "/en/login";
        return;
      }

      setEmail(data.user.email);

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
        setSource("saved");
        return;
      }

      // Load pending experience
      const p = getPendingExperience();
      if (!p) {
        window.location.href = "/en/journal/new";
      } else {
        setPending({ ...p, language: "en" });
        setSource("pending");
      }
    });
  }, [experienceId]);

  if (!email || !pending) return <p>Loading...</p>;

  const interpretation = generateMeq30Interpretation(
    pending.scores,
    pending.language
  );

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/meq30/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pending.title,
          date: pending.date,
          notes: pending.notes,
          answers: pending.answers,
          language: "en",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");

      clearPendingExperience();
      window.location.href = "/en/journal";
    } catch (e: any) {
      alert("Save failed: " + (e?.message ?? String(e)));
      setSaving(false);
    }
  }

  function handleEdit() {
    // Keep the pending experience and go back to edit
    window.location.href = "/en/journal/new";
  }

  function handleDelete() {
    if (confirm("Are you sure you want to discard this experience?")) {
      clearPendingExperience();
      window.location.href = "/en/journal/new";
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review Experience</h1>
        <Link href="/en/journal" className="text-sm underline">
          ← Back to Journal
        </Link>
      </div>

      {/* Experience Details */}
      <div className="border rounded-lg p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <p className="text-lg">{pending.title}</p>
        </div>

        {pending.date && (
          <div>
            <label className="text-sm font-medium">Date</label>
            <p>{new Date(pending.date).toLocaleDateString()}</p>
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
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">MEQ-30 Scores</h2>
        <p className="text-sm font-medium">
          {pending.scores.complete_mystical
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

          {pending.scores.complete_mystical && (
            <div className="col-span-2 bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-900">
                ✓ Complete Mystical Experience (all subscales ≥ 60%)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interpretation */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Interpretation</h2>
        <p className="text-sm leading-relaxed">{interpretation.paragraph}</p>
      </div>

      {source === "pending" && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            onClick={handleEdit}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      )}
    </main>
  );
}
