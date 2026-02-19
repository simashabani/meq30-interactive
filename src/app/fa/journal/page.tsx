"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { getPendingExperience, savePendingExperience } from "@/lib/pendingExperience";
import { gregorianToJalali } from "@/lib/persianDate";
import { toPersianNumerals } from "@/lib/persianNumerals";

const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

function formatPersianDate(jalaliDateStr: string): string {
  if (!jalaliDateStr) return "—";
  const [y, m, d] = jalaliDateStr.split("-").map(Number);
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
  const [pendingExists, setPendingExists] = useState(false);
  const [sortBy, setSortBy] = useState<{ column: string; ascending: boolean }>({ column: "occurred_at", ascending: false });
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [defaultLanguage, setDefaultLanguage] = useState<"en" | "fa">("fa");
  const [researchContact, setResearchContact] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? null);
        setUserId(data.user.id);
      }
      setAuthChecked(true);
    });

    const pending = getPendingExperience();
    if (pending?.isDirty) setPendingExists(true);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    (async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select(`id,title,occurred_at,notes,meq30_responses(complete_mystical,language)`)
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
      experienceId,
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
      isDirty: false,
    };

    savePendingExperience(pending as any);
    const entryLang = respData.language === "fa" ? "fa" : "en";
    window.location.href = `/${entryLang}/journal/new?loadPending=1`;
  }

  async function handleDelete(experienceId: string) {
    if (!confirm("این تجربه حذف شود؟")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("meq30_responses").delete().eq("experience_id", experienceId);
    const { error } = await supabase.from("experiences").delete().eq("id", experienceId);
    if (error) {
      alert("حذف تجربه ناموفق بود.");
      return;
    }
    setExperiences((prev) => (prev ? prev.filter((e) => e.id !== experienceId) : prev));
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

  const handleLogin = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/fa/journal` },
    });
    setLoginMessage(error ? error.message : "لینک ورود به ایمیل شما ارسال شد.");
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/fa/journal";
  };

  if (!authChecked) return <p>در حال بارگذاری...</p>;

  if (!userId) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '2rem', fontWeight: 600, marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>دفتر تجربه‌های من</h1>

        {/* Auth box */}
        <div style={{ background: '#f5f5f0', padding: '2rem', marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
            ما از روش احراز هویت بدون رمز عبور استفاده می‌کنیم که یک URL منحصر به فرد، محدود به زمان و یک‌بار مصرف به صندوق ورودی شما ارسال می‌کند تا هویت شما را تأیید کند. تنها چیزی که برای ثبت‌نام یا ورود نیاز دارید یک آدرس ایمیل معتبر است.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: '10px 12px', border: '1px solid #ddd', fontSize: '1rem' }}
              placeholder="ایمیل"
            />
            <button 
              onClick={handleLogin} 
              style={{ 
                background: '#3d3d3d', 
                color: 'white', 
                padding: '10px 24px', 
                border: 'none', 
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              ارسال لینک
            </button>
          </div>
          {loginMessage && <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>{loginMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>دفتر تجربه‌های من</h1>
        <Link 
          href="/fa/journal/new"
          style={{ 
            background: '#3d3d3d', 
            color: 'white', 
            padding: '12px 24px', 
            textDecoration: 'none',
            letterSpacing: '0.08em',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'inline-block'
          }}
        >
          + تجربه جدید
        </Link>
      </div>

      {/* Welcome box */}
      <div style={{ background: '#f5f5f0', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p>خوش آمدید، {email}</p>
        <button 
          onClick={handleLogout} 
          style={{ 
            background: '#8c8c7e', 
            color: 'white', 
            padding: '8px 20px', 
            border: 'none', 
            cursor: 'pointer',
            letterSpacing: '0.08em',
            fontSize: '0.875rem'
          }}
        >
          خروج
        </button>
      </div>

      {pendingExists && (
        <div style={{ background: '#ebebeb', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ marginBottom: '1rem' }}>شما یک تجربهٔ ذخیره‌نشده دارید.</p>
          <button
            onClick={() => (window.location.href = "/fa/journal/new?loadPending=1")}
            style={{ 
              background: '#3d3d3d', 
              color: 'white', 
              padding: '10px 24px', 
              border: 'none', 
              cursor: 'pointer',
              letterSpacing: '0.08em',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            مشاهده / ویرایش ذخیره‌نشده
          </button>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>تجربه‌های ثبت‌شده</h2>
        {experiences === null ? (
          <p>در حال بارگذاری...</p>
        ) : experiences.length === 0 ? (
          <p>هنوز تجربه‌ای ثبت نشده. <Link href="/fa/journal/new" style={{ textDecoration: 'underline', color: '#3d3d3d' }}>ثبت تجربه</Link>.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #3d3d3d' }}>
                <th style={{ padding: '12px 8px', textAlign: 'right', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("title")}>
                  عنوان{renderSortIndicator("title")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("occurred_at")}>
                  تاریخ تجربه{renderSortIndicator("occurred_at")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("complete_mystical")}>
                  صوفیانه؟{renderSortIndicator("complete_mystical")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>ویرایش</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>حذف</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((e: any) => {
                const resp = Array.isArray(e.meq30_responses) ? e.meq30_responses[0] : e.meq30_responses;
                const entryLang = resp?.language === "fa" ? "fa" : "en";
                const persianDateOfExperience = e.occurred_at ? formatPersianDate(gregorianToJalali(e.occurred_at.slice(0, 10))) : "—";
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <Link style={{ color: '#3d3d3d', textDecoration: 'underline' }} href={`/${entryLang}/journal/review?id=${e.id}`}>
                        {e.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{persianDateOfExperience}</td>
                    <td style={{ padding: '12px 8px' }}>{resp ? (resp.complete_mystical ? "بله" : "خیر") : "—"}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <button style={{ color: '#3d3d3d', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => handleEdit(e.id)}>
                        ویرایش
                      </button>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button style={{ color: '#c53030', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => handleDelete(e.id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
