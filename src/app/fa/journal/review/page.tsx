"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import {
  getPendingExperience,
  clearPendingExperience,
  savePendingExperience,
  PendingExperience,
} from "@/lib/pendingExperience";
import { generateMeq30Interpretation } from "@/lib/interpretation/generateMeq30Interpretation";

type ReviewExperience = PendingExperience & {
  language: "en" | "fa";
};

const toPersianNumerals = (value: string | number) =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export default function ReviewPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [pending, setPending] = useState<ReviewExperience | null>(null);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<"pending" | "saved" | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const experienceId = new URLSearchParams(window.location.search).get("id");

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        window.location.href = "/fa/login";
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
          alert("بارگذاری تجربه ناموفق بود.");
          window.location.href = "/fa/journal";
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
          alert("پاسخ MEQ برای این تجربه یافت نشد.");
          window.location.href = "/fa/journal";
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
        setSource("saved");
        return;
      }

      const p = getPendingExperience();
      if (!p) {
        window.location.href = "/fa/journal/new";
      } else {
        setPending({ ...p, language: "fa" });
        setSource("pending");
      }
    });
  }, []);

  if (!email || !pending) return <p>در حال بارگذاری...</p>;

  const interpretation = generateMeq30Interpretation(
    pending.scores,
    pending.language
  );

  async function handleSave() {
    if (saving || !pending) return;

    setSaving(true);
    try {
      const res = await fetch("/api/meq30/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId: pending.experienceId,
          title: pending.title,
          date: pending.date,
          notes: pending.notes,
          answers: pending.answers,
          language: "fa",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submit failed");

      clearPendingExperience();
      window.location.href = "/fa/journal";
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      alert("ذخیره ناموفق بود: " + message);
      setSaving(false);
    }
  }

  function handleEdit() {
    window.location.href = "/fa/journal/new?loadPending=1";
  }

  function handleDelete() {
    if (confirm("آیا مطمئن هستید که می‌خواهید این تجربه را حذف کنید؟")) {
      clearPendingExperience();
      window.location.href = "/fa/journal/new";
    }
  }

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
    window.location.href = "/fa/journal/new?loadPending=1";
  }

  async function handleDeleteSaved() {
    if (!pending?.experienceId) return;
    if (!confirm("این تجربه حذف شود؟")) return;

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
      alert("حذف تجربه ناموفق بود.");
      return;
    }

    window.location.href = "/fa/journal";
  }

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">بررسی تجربه</h1>
        <Link href="/fa/journal" className="text-sm underline">
          بازگشت به دفتر ←
        </Link>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">عنوان</label>
          <p className="text-lg">{pending.title}</p>
        </div>

        {pending.date && (
          <div>
            <label className="text-sm font-medium">تاریخ</label>
            <p>
              {new Date(`${pending.date}T00:00:00Z`).toLocaleDateString("fa-IR", {
                timeZone: "UTC",
              })}
            </p>
          </div>
        )}

        {pending.notes && (
          <div>
            <label className="text-sm font-medium">یادداشت</label>
            <p className="whitespace-pre-wrap text-sm">{pending.notes}</p>
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-lg font-semibold">امتیازهای MEQ-30</h2>
        <p className="text-sm font-medium">
          {pending.scores.complete_mystical
            ? "تجربه شما عرفانی است."
            : "تجربه شما عرفانی نیست."}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">رازمندانه</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(pending.scores.mystical_percentage.toFixed(0))}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">خلق مثبت</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(
                pending.scores.positive_mood_percentage.toFixed(0)
              )}
              %
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">زمان و فضا</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(pending.scores.time_space_percentage.toFixed(0))}%
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">وصف‌ناپذیری</label>
            <p className="text-xl font-bold">
              {toPersianNumerals(pending.scores.ineffability_percentage.toFixed(0))}
              %
            </p>
          </div>

          {pending.scores.complete_mystical && (
            <div className="col-span-2 bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm font-medium text-blue-900">
                ✓ تجربه عرفانی کامل (همه زیرمقیاس‌ها ≥ ۶۰٪)
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">تفسیر</h2>
        <p className="text-sm leading-relaxed">{interpretation.paragraph}</p>
      </div>

      {source === "pending" && (
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
      )}

      {source === "saved" && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleEditSaved}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            ویرایش
          </button>
          <button
            onClick={handleDeleteSaved}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            حذف
          </button>
        </div>
      )}
    </main>
  );
}