"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { savePendingExperience } from "@/lib/pendingExperience";
import { gregorianToJalali } from "@/lib/persianDate";
import { toPersianNumerals } from "@/lib/persianNumerals";

const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

function formatPersianDate(jalaliDateStr: string): string {
  if (!jalaliDateStr) return "—";
  const [y, m, d] = jalaliDateStr.split("-").map(Number);
  const monthName = PERSIAN_MONTHS[m - 1];
  return `${toPersianNumerals(y)} ${monthName} ${toPersianNumerals(d)}`;
}

function formatGregorianDateToPersian(gregorianDate: string): string {
  if (!gregorianDate) return "—";
  const jalaliDate = gregorianToJalali(gregorianDate.slice(0, 10));
  const [y, m, d] = jalaliDate.split("-").map(Number);
  const monthName = PERSIAN_MONTHS[m - 1];
  return `${toPersianNumerals(y)} ${monthName} ${toPersianNumerals(d)}`;
}

function sortExperiences(data: any[], column: string, ascending: boolean) {
  const sorted = [...data].sort((a, b) => {
    let aVal: any = a[column];
    let bVal: any = b[column];

    if (column === "complete_mystical") {
      aVal = (Array.isArray(a.meq30_responses) ? a.meq30_responses[0] : a.meq30_responses)?.complete_mystical ?? false;
      bVal = (Array.isArray(b.meq30_responses) ? b.meq30_responses[0] : b.meq30_responses)?.complete_mystical ?? false;
    }

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
  return sorted;
}

export default function JournalPageFa() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<any[] | null>(null);
  const [sortBy, setSortBy] = useState<{ column: string; ascending: boolean }>({ column: "updated_at", ascending: false });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/fa/login";
      } else {
        setEmail(data.user.email);
        setUserId(data.user.id);
      }
    });
    // load experiences when user id set in separate effect
  }, []);

  useEffect(() => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    (async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select(`id,title,occurred_at,updated_at,notes,meq30_responses(complete_mystical)`)
        .eq("user_id", userId);
      if (error) {
        console.error("Failed to load experiences", error);
        setExperiences([]);
      } else {
        const sorted = sortExperiences(data ?? [], sortBy.column, sortBy.ascending);
        setExperiences(sorted);
      }
    })();
  }, [userId, sortBy]);

  async function handleEdit(experienceId: string) {
    const supabase = createSupabaseBrowserClient();
    const { data: expData, error: expErr } = await supabase
      .from("experiences")
      .select("id,title,occurred_at,notes")
      .eq("id", experienceId)
      .single();
    if (expErr || !expData) {
      alert("بارگذاری تجربه برای ویرایش ناموفق بود");
      return;
    }

    const { data: respData, error: respErr } = await supabase
      .from("meq30_responses")
      .select("language,answers,mystical_percentage,positive_mood_percentage,time_space_percentage,ineffability_percentage,complete_mystical")
      .eq("experience_id", experienceId)
      .single();

    if (respErr || !respData) {
      alert("پاسخ MEQ برای این تجربه یافت نشد.");
      return;
    }

    const pending = {
      title: expData.title ?? "",
      date: expData.occurred_at ? new Date(expData.occurred_at).toISOString().slice(0, 10) : "",
      notes: expData.notes ?? "",
      answers: respData.answers ?? {},
      scores: {
        mystical_percentage: respData.mystical_percentage ?? 0,
        positive_mood_percentage: respData.positive_mood_percentage ?? 0,
        time_space_percentage: respData.time_space_percentage ?? 0,
        ineffability_percentage: respData.ineffability_percentage ?? 0,
        complete_mystical: respData.complete_mystical ?? false,
      },
    };

    savePendingExperience(pending as any);
    // Redirect based on entry's language
    const entryLang = respData.language === "fa" ? "fa" : "en";
    window.location.href = `/${entryLang}/journal/new?loadPending=1`;
  }

  function handleSort(column: string) {
    setSortBy((prev) => {
      if (prev.column === column) {
        return { column, ascending: !prev.ascending };
      } else {
        return { column, ascending: true };
      }
    });
  }

  function renderSortIndicator(column: string) {
    if (sortBy.column !== column) return " ↕";
    return sortBy.ascending ? " ↑" : " ↓";
  }

  if (!email) return <p>در حال بارگذاری...</p>;

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">دفتر خاطرات</h1>
      <p className="text-sm">خوش آمدید، {email}</p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/fa/journal/new"
            className="inline-block px-4 py-2 rounded bg-black text-white"
          >
            تجربهٔ جدید
          </Link>

          <Link href="/fa" className="text-sm underline">
            ← بازگشت
          </Link>
        </div>

        {/* Experiences table (simple) */}
        <div className="w-full mt-4">
          <h2 className="text-lg font-semibold">تجربه‌های ثبت‌شده</h2>
          {experiences === null ? (
            <p>در حال بارگذاری...</p>
          ) : experiences.length === 0 ? (
            <p>هنوز تجربه‌ای ثبت نشده. <Link href="/fa/journal/new">ثبت تجربه</Link>.</p>
          ) : (
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("title")}>
                    عنوان{renderSortIndicator("title")}
                  </th>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("occurred_at")}>
                    تاریخ تجربه{renderSortIndicator("occurred_at")}
                  </th>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("complete_mystical")}>
                    صوفیانه؟{renderSortIndicator("complete_mystical")}
                  </th>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_at")}>
                    تاریخ ذخیره{renderSortIndicator("updated_at")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((e: any) => {
                  const resp = Array.isArray(e.meq30_responses) ? e.meq30_responses[0] : e.meq30_responses;
                  const persianDateOfExperience = e.occurred_at ? formatPersianDate(gregorianToJalali(e.occurred_at.slice(0, 10))) : "—";
                  const savedAtDate = formatGregorianDateToPersian(e.updated_at);
                  return (
                    <tr key={e.id}>
                      <td className="py-2 border-b">
                        <button className="text-blue-600 underline" onClick={() => handleEdit(e.id)}>
                          {e.title}
                        </button>
                      </td>
                      <td className="py-2 border-b">{persianDateOfExperience}</td>
                      <td className="py-2 border-b">{resp ? (resp.complete_mystical ? "بله" : "خیر") : "—"}</td>
                      <td className="py-2 border-b">{savedAtDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
