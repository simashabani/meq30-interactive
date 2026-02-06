"use client";

import * as React from "react";
import { MEQ30_QUESTIONS } from "@/lib/meq30Questions";

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
              {q.order}. {q.text[lang] || q.text.en}
            </legend>

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
                    <span className="font-semibold">{s.v}</span>{" "}
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
