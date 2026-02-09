"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import MEQ30Form, { MEQAnswersMap } from "@/components/MEQ30Form";
import { MEQ30Scores, scoreMEQ30 } from "@/lib/meq30Score";
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
  const [noDate, setNoDate] = useState(false); // checkbox: "I don't have a date"
  const [notes, setNotes] = useState("");

  // Answers map: canonicalId (string) -> 0..5
  const [answers, setAnswers] = React.useState<MEQAnswersMap>({});

  const [saving, setSaving] = useState(false);
  const [pendingExists, setPendingExists] = useState(false);
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const skipDirtyRef = useRef(false);
  const lastScoresRef = useRef<MEQ30Scores | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const initialSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/en/login";
      } else {
        setEmail(data.user.email);
      }
    });

    // Check for pending experience but do NOT auto-load it unless requested via URL
    const pending = getPendingExperience();
    const params = new URLSearchParams(window.location.search);
    if (params.get("loadPending") === "1") {
      // load it automatically
      loadPending();
    } else if (pending?.isDirty) {
      setPendingExists(true);
    }
  }, []);

  function autofillAll(value: number) {
    const filled: MEQAnswersMap = {};
    for (const q of MEQ30_QUESTIONS) {
      filled[String(q.canonicalId)] = value;
    }
    setAnswers(filled);
  }

  function loadPending() {
    const p = getPendingExperience();
    if (!p) return;
    skipDirtyRef.current = true;
    setEditingExperienceId(p.experienceId ?? null);
    setTitle(p.title);
    setDate(p.date ?? "");
    setNotes(p.notes ?? "");
    setAnswers(p.answers ?? {});
    initialSnapshotRef.current = snapshotForDirty(
      p.title,
      p.date ?? "",
      p.notes ?? "",
      p.answers ?? {}
    );
    lastScoresRef.current = p.scores ?? null;
    setPendingLoaded(true);
    setPendingExists(false);
  }

  function startNew() {
    skipDirtyRef.current = true;
    setEditingExperienceId(null);
    initialSnapshotRef.current = null;
    clearPendingExperience();
    setPendingExists(false);
    setPendingLoaded(false);
    setTitle("");
    setDate("");
    setNoDate(false);
    setNotes("");
    setAnswers({});
    lastScoresRef.current = null;
  }

  function handleSave() {
    if (!canSave || saving) return;

    setSaving(true);
    try {
      // Score the answers
      const scores = scoreMEQ30(answers);

      // Save to session storage
      savePendingExperience({
        experienceId: editingExperienceId ?? undefined,
        title,
        date,
        notes,
        answers,
        scores,
        isDirty: true,
      });

      // Redirect to review page
      window.location.href = "/en/journal/review";
    } catch (e: any) {
      alert("Error: " + (e?.message ?? String(e)));
      setSaving(false);
    }
  }

  useEffect(() => {
    if (skipDirtyRef.current) {
      skipDirtyRef.current = false;
      return;
    }

    if (!title && !date && !notes && Object.keys(answers).length === 0) {
      return;
    }

    const snapshot = snapshotForDirty(title, date, notes, answers);
    const isDirtyNow = initialSnapshotRef.current
      ? snapshot !== initialSnapshotRef.current
      : true;

    let scores = lastScoresRef.current;
    try {
      scores = scoreMEQ30(answers);
      lastScoresRef.current = scores;
    } catch {
      // Keep last computed scores when answers are incomplete.
    }

    if (!scores) return;

    savePendingExperience({
      experienceId: editingExperienceId ?? undefined,
      title,
      date,
      notes,
      answers,
      scores,
      isDirty: isDirtyNow,
    });
    setPendingExists(isDirtyNow);
  }, [title, date, notes, answers]);

  function snapshotForDirty(
    t: string,
    d: string,
    n: string,
    a: MEQAnswersMap
  ) {
    const sortedAnswers = Object.keys(a)
      .sort()
      .reduce<Record<string, number>>((acc, key) => {
        acc[key] = a[key];
        return acc;
      }, {});
    return JSON.stringify({ t, d, n, a: sortedAnswers });
  }

  if (!email) return <p>Loading...</p>;

  const answeredCount = Object.keys(answers).length;
  const canSave = title.trim().length > 0 && answeredCount === 30;

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
            className={`border rounded px-3 py-2 ${
              noDate ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
            }`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={noDate}
          />
          <label className="flex items-center gap-2 mt-2 text-sm">
            <input
              type="checkbox"
              checked={noDate}
              onChange={(e) => {
                setNoDate(e.target.checked);
                if (e.target.checked) setDate("");
              }}
            />
            I don't have a date for my experience
          </label>
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

      {pendingExists && !pendingLoaded && (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <p className="text-sm">
            You have an unsaved experience. Would you like to view/edit and save it, or start a new blank experience?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={loadPending}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              View / Edit Unsaved
            </button>
            <button
              onClick={startNew}
              className="px-3 py-1 rounded bg-gray-200"
            >
              Start New (discard unsaved)
            </button>
          </div>
        </div>
      )}

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
