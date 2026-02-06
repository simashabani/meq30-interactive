"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import MEQ30Form, { MEQAnswersMap } from "@/components/MEQ30Form";
import { scoreMEQ30 } from "@/lib/meq30Score";
import { MEQ30_QUESTIONS } from "@/lib/meq30Questions";
import { toPersianNumerals } from "@/lib/persianNumerals";
import {
  savePendingExperience,
  getPendingExperience,
  clearPendingExperience,
} from "@/lib/pendingExperience";

export default function NewExperiencePageFa() {
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
        window.location.href = "/fa/login";
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

  if (!email) return <p>در حال بارگذاری...</p>;

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
      window.location.href = "/fa/journal/review";
    } catch (e: any) {
      alert("خطا: " + (e?.message ?? String(e)));
      setSaving(false);
    }
  }

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">تجربهٔ جدید</h1>
        <Link href="/fa/journal" className="text-sm underline">
          ← بازگشت به دفتر
        </Link>
      </div>

      {/* Experience metadata */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">عنوان (اجباری)</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            placeholder="مثلاً: مراقبه در غروب کوهستان"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">تاریخ (اختیاری)</label>
          <input
            className="border rounded px-3 py-2"
            type="date"
            lang="fa"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">یادداشت (اختیاری)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="هر نکته‌ای که می‌خواهید ثبت کنید..."
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
            تست: پر کردن همه = ۳ (متوسط)
          </button>

          <button
            type="button"
            className="px-3 py-2 rounded border text-sm"
            onClick={() => setAnswers({})}
          >
            پاک کردن پاسخ‌ها
          </button>
        </div>
      </div>

      <p className="text-sm">
        پاسخ داده‌شده: <b>{toPersianNumerals(answeredCount)}</b> / {toPersianNumerals(30)}
      </p>

      <MEQ30Form lang="fa" value={answers} onChange={setAnswers} />

      <button
        className="mt-6 px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={!canSave || saving}
        onClick={handleSave}
      >
        {saving ? "درحال تجزیه..." : "تجزیه"}
      </button>
    </main>
  );
}
