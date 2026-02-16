"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import MEQ30Form, { MEQAnswersMap } from "@/components/MEQ30Form";
import { MEQ30Scores, scoreMEQ30 } from "@/lib/meq30Score";
import { MEQ30_QUESTIONS } from "@/lib/meq30Questions";
import { gregorianToJalali, jalaliToGregorian } from "@/lib/persianDate";
import { toPersianNumerals } from "@/lib/persianNumerals";
import PersianDatePicker from "@/components/PersianDatePicker";
import {
  savePendingExperience,
  getPendingExperience,
  clearPendingExperience,
} from "@/lib/pendingExperience";

export default function NewExperiencePageFa() {
  const [email, setEmail] = useState<string | null>(null);

  // Experience metadata
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10)); // default to today
  const [noDate, setNoDate] = useState(false); // checkbox: "I don't have a date"
  const [calendarMode, setCalendarMode] = useState<"english" | "persian">("english"); // Form-level calendar selection
  const [notes, setNotes] = useState("");

  // Answers map: canonicalId (string) -> 0..5
  const [answers, setAnswers] = React.useState<MEQAnswersMap>({});

  const [saving, setSaving] = useState(false);
  const [pendingExists, setPendingExists] = useState(false);
  const [pendingLoaded, setPendingLoaded] = useState(false);
  const skipDirtyRef = useRef(true);
  const lastScoresRef = useRef<MEQ30Scores | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const initialSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/fa/login";
      } else {
        setEmail(data.user.email ?? null);
      }
    });

    // Check for pending experience but do NOT auto-load it unless requested via URL
    const pending = getPendingExperience();
    const params = new URLSearchParams(window.location.search);
    if (params.get("loadPending") === "1") {
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

  async function handleSave() {
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
      window.location.href = "/fa/journal/review";
    } catch (e: any) {
      alert("خطا: " + (e?.message ?? String(e)));
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

  if (!email) return <p>در حال بارگذاری...</p>;

  const answeredCount = Object.keys(answers).length;
  const canSave = title.trim().length > 0 && answeredCount === 30;

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

          {/* Calendar mode selection - Radio buttons */}
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="calendar-mode"
                checked={calendarMode === "english"}
                onChange={() => setCalendarMode("english")}
                disabled={noDate}
              />
              <span>تاریخ میلادی</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="calendar-mode"
                checked={calendarMode === "persian"}
                onChange={() => setCalendarMode("persian")}
                disabled={noDate}
              />
              <span>تاریخ شمسی</span>
            </label>
          </div>

          {/* Both calendars visible; only the selected one is editable */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-gray-600">تاریخ میلادی</label>
              <input
                className={`w-full border rounded px-3 py-2 ${
                  noDate || calendarMode !== "english"
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : ""
                }`}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={noDate || calendarMode !== "english"}
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">تاریخ شمسی</label>
              <div className={noDate || calendarMode !== "persian" ? "opacity-50 pointer-events-none" : ""}>
                <PersianDatePicker
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  disabled={noDate || calendarMode !== "persian"}
                />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 mt-2 text-sm">
            <input
              type="checkbox"
              checked={noDate}
              onChange={(e) => {
                setNoDate(e.target.checked);
                if (e.target.checked) setDate("");
              }}
            />
            برای این تجربه تاریخ ندارم
          </label>
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

      {pendingExists && !pendingLoaded && (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <p className="text-sm">
            شما یک تجربهٔ ذخیره‌نشده دارید. آیا می‌خواهید آن را ببینید/ویرایش و ذخیره کنید، یا یک تجربهٔ جدید ثبت کنید؟
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={loadPending}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              مشاهده / ویرایش ذخیره‌نشده
            </button>
            <button
              onClick={startNew}
              className="px-3 py-1 rounded bg-gray-200"
            >
              شروع جدید (حذف ذخیره‌نشده)
            </button>
          </div>
        </div>
      )}

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
