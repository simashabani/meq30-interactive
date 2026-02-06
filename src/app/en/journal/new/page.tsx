"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import MEQ30Form, { MEQAnswersMap } from "@/components/MEQ30Form";
import { scoreMEQ30 } from "@/lib/meq30Score";
import { MEQ30_QUESTIONS } from "@/lib/meq30Questions";
import {
  savePendingExperience,
  getPendingExperience,
  clearPendingExperience,
} from "@/lib/pendingExperience";

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

    // Load pending experience if editing
    const pending = getPendingExperience();
    if (pending) {
      setTitle(pending.title);
      setDate(pending.date);
      setNotes(pending.notes);
      setAnswers(pending.answers);
    }
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

  function handleSave() {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      // Score the answers
      const scores = scoreMEQ30(answers);

      // Save to session storage
      savePendingExperience({
        title,
        date,
        notes,
        answers,
        scores,
      });

      // Redirect to review page
      window.location.href = "/en/journal/review";
    } catch (e: any) {
      alert("Error: " + (e?.message ?? String(e)));
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

      {/* Analyze */}
      <button
        className="mt-6 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={!canSave || saving}
        onClick={handleSave}
      >
        {saving ? "Analyzing..." : "Analyze"}
      </button>
    </main>
  );
}
