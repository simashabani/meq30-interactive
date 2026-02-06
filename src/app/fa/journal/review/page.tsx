"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  getPendingExperience,
  clearPendingExperience,
  PendingExperience,
} from "@/lib/pendingExperience";
import { toPersianNumerals } from "@/lib/persianNumerals";

export default function ReviewPageFa() {
  const [email, setEmail] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingExperience | null>(null);
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

    // Load pending experience
    const p = getPendingExperience();
    if (!p) {
      window.location.href = "/fa/journal/new";
    } else {
      setPending(p);
    }
  }, []);

  if (!email || !pending) return <p>در حال بارگذاری...</p>;

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        window.location.href = "/fa/login";
        return;
      }

      const occurred_at = pending.date
        ? new Date(pending.date).toISOString()
        : null;

      // 1) Insert experience
      const { data: exp, error: expErr } = await supabase
        .from("experiences")
        .insert({
          user_id: userData.user.id,
          title: pending.title.trim(),
          occurred_at,
          notes: pending.notes.trim() || null,
          is_shared_for_research: false,
        })
        .select("id")
        .single();

      if (expErr) throw expErr;

      // 2) Insert MEQ response
      const { error: respErr } = await supabase
        .from("meq30_responses")
        .insert({
          experience_id: exp.id,
          answers: pending.answers,
          mystical_percentage: pending.scores.mystical_percentage,
          positive_mood_percentage: pending.scores.positive_mood_percentage,
          time_space_percentage: pending.scores.time_space_percentage,
          ineffability_percentage: pending.scores.ineffability_percentage,
          complete_mystical: pending.scores.complete_mystical,
          interpretation_key: "pending_v1",
          interpretation_en: null,
          interpretation_fa: null,
        });

      if (respErr) throw respErr;

      clearPendingExperience();
      window.location.href = "/fa/journal";
    } catch (e: any) {
      alert("ذخیره ناموفق بود: " + (e?.message ?? String(e)));
      setSaving(false);
    }
  }

  function handleEdit() {
    // Keep the pending experience and go back to edit
    window.location.href = "/fa/journal/new";
  }

  function handleDelete() {
    if (confirm("آیا مطمئن هستید که می‌خواهید این تجربه را حذف کنید؟")) {
      clearPendingExperience();
      window.location.href = "/fa/journal/new";
    }
  }

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">بررسی تجربه</h1>
        <Link href="/fa/journal" className="text-sm underline">
          ← بازگشت به دفتر
        </Link>
      </div>

      {/* Experience Details */}
      <div className="border rounded-lg p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">عنوان</label>
          <p className="text-lg">{pending.title}</p>
        </div>

        {pending.date && (
          <div>
            <label className="text-sm font-medium">تاریخ</label>
            <p>{new Date(pending.date).toLocaleDateString("fa-IR")}</p>
          </div>
        )}

        {pending.notes && (
          <div>
            <label className="text-sm font-medium">یادداشت</label>
            <p className="whitespace-pre-wrap text-sm">{pending.notes}</p>
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">نمرات MEQ-30</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">رازمندانه</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(
                pending.scores.mystical_percentage.toFixed(0)
              )}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">حالت مثبت</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(
                pending.scores.positive_mood_percentage.toFixed(0)
              )}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">فراتر رفتن از زمان و فضا</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(
                pending.scores.time_space_percentage.toFixed(0)
              )}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">ناگفتنی</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(
                pending.scores.ineffability_percentage.toFixed(0)
              )}%
            </p>
          </div>

          {pending.scores.complete_mystical && (
            <div className="col-span-2 bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-900">
                ✓ تجربهٔ صوفیانهٔ مکمل (تمام بخش‌ها ≥ ۶۰%)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
        >
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </button>

        <button
          onClick={handleEdit}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          ویرایش
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          حذف
        </button>
      </div>
    </main>
  );
}
