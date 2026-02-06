"use client";

import * as React from "react";
import { MEQ30_QUESTIONS } from "@/lib/meq30Questions";
import { toPersianNumerals } from "@/lib/persianNumerals";

export type MEQAnswersMap = Record<string, number>; // key = canonicalId as string

type Props = {
  lang: "en" | "fa";
  value: MEQAnswersMap;
  onChange: (next: MEQAnswersMap) => void;
};

const SCALE = [
  { v: 0, en: "none; not at all", fa: "هیچ؛ اصلاً" },
  { v: 1, en: "so slight; cannot decide", fa: "آن‌قدر خفیف که نمی‌توانم تصمیم بگیرم" },
  { v: 2, en: "slight", fa: "خفیف" },
  { v: 3, en: "moderate", fa: "متوسط" },
  { v: 4, en: "strong", fa: "قوی" },
  { v: 5, en: "extreme", fa: "شدید" },
] as const;

const SUBSCALE_LABELS = {
  MYSTICAL: {
    en: "Mystical (Unity / Noetic / Sacredness)",
    fa: "رازمندانه (وحدت / درک / تقدس)",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  POSITIVE_MOOD: {
    en: "Positive Mood",
    fa: "حالت مثبت",
    color: "bg-green-50 border-green-200 text-green-700",
  },
  TIME_SPACE: {
    en: "Transcendence of Time and Space",
    fa: "فراتر رفتن از زمان و فضا",
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  INEFFABILITY: {
    en: "Ineffability",
    fa: "ناگفتنی",
    color: "bg-amber-50 border-amber-200 text-amber-700",
  },
} as const;

export default function MEQ30Form({ lang, value, onChange }: Props) {
  const dir = lang === "fa" ? "rtl" : "ltr";

  return (
    <div dir={dir} className="space-y-6">
      {MEQ30_QUESTIONS.map((q) => {
        const key = String(q.canonicalId);
        const selected = value[key];

        return (
          <fieldset key={q.canonicalId} className="border rounded-lg p-4">
            <legend className="font-medium">
              {lang === "fa" ? toPersianNumerals(q.order) : q.order}. {q.text[lang] || q.text.en}
            </legend>
            
            <div className={`mt-2 mb-4 p-2 text-xs font-semibold border rounded ${SUBSCALE_LABELS[q.subscale].color}`}>
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
