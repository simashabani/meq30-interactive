"use client";

import * as React from "react";
import { MEQ30_QUESTIONS } from "@/lib/meq30Questions";
import { toPersianNumerals } from "@/lib/persianNumerals";

export type MEQAnswersMap = Record<string, number>; // key = canonicalId as string

type Props = {
  lang: "en" | "fa";
  value: MEQAnswersMap;
  onChange: (next: MEQAnswersMap) => void;
  highlightUnanswered?: boolean;
  missingCanonicalIds?: number[];
};

const SCALE = [
  { v: 0, en: "none; not at all", fa: "هیچ؛ اصلاً" },
  { v: 1, en: "so slight; cannot decide", fa: "آن‌قدر خفیف که نمی‌توانم تصمیم بگیرم" },
  { v: 2, en: "slight", fa: "خفیف" },
  { v: 3, en: "moderate", fa: "متوسط" },
  { v: 4, en: "strong", fa: "قوی" },
  { v: 5, en: "extreme", fa: "بسیار قوی" },
] as const;

const SUBSCALE_LABELS = {
  MYSTICAL: {
    en: "Mystical (Unity / Noetic / Sacredness)",
    fa: "احساس یگانگی، کیفیت معرفتی، و حسّ تقدّس",
    style: { backgroundColor: "#697124", borderColor: "#697124", color: "#ffffff" },
  },
  POSITIVE_MOOD: {
    en: "Positive Mood",
    fa: "حالت عاطفی مثبت",
    style: { backgroundColor: "#828b2c", borderColor: "#828b2c", color: "#ffffff" },
  },
  TIME_SPACE: {
    en: "Transcendence of Time and Space",
    fa: "فراتر رفتن از زمان و مکان",
    style: { backgroundColor: "#939d32", borderColor: "#939d32", color: "#ffffff" },
  },
  INEFFABILITY: {
    en: "Ineffability",
    fa: "ناگفتنی بودن و وصف‌ناپذیری",
    style: { backgroundColor: "#a3af37", borderColor: "#a3af37", color: "#ffffff" },
  },
} as const;

export default function MEQ30Form({
  lang,
  value,
  onChange,
  highlightUnanswered = false,
  missingCanonicalIds = [],
}: Props) {
  const dir = lang === "fa" ? "rtl" : "ltr";
  const missingSet = new Set(missingCanonicalIds.map((id) => String(id)));

  return (
    <div dir={dir} className="space-y-6">
      {MEQ30_QUESTIONS.map((q) => {
        const key = String(q.canonicalId);
        const selected = value[key];
        const isMissing = highlightUnanswered && missingSet.has(key);

        return (
          <fieldset
            key={q.canonicalId}
            className="border p-4 bg-white"
            style={
              isMissing
                ? { backgroundColor: "#fff5f5", borderColor: "#f1caca" }
                : undefined
            }
          >
            <legend className="font-medium">
              {lang === "fa" ? toPersianNumerals(q.order) : q.order}. {q.text[lang] || q.text.en}
            </legend>
            
            <div className="mt-2 mb-4 p-2 text-xs font-semibold border" style={SUBSCALE_LABELS[q.subscale].style}>
              {SUBSCALE_LABELS[q.subscale][lang]}
            </div>

            <div className="mt-3 grid gap-2">
              {SCALE.map((s) => (
                <label
                  key={s.v}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name={`meq_${q.canonicalId}`}
                    value={s.v}
                    checked={selected === s.v}
                    onChange={() => {
                      onChange({ ...value, [key]: s.v });
                    }}
                  />
                  <span className="text-sm">
                    <span className="font-semibold">{lang === "fa" ? toPersianNumerals(s.v) : s.v}</span>{" "}
                    — {lang === "fa" ? s.fa : s.en}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
