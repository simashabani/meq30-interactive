"use client";

import { useEffect, useState, type CSSProperties } from "react";
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

  const newExperienceButtonStyle: CSSProperties = {
    background: '#3d3d3d',
    color: 'white',
    padding: '12px 24px',
    textDecoration: 'none',
    fontFamily: 'inherit',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'inline-block',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease'
  };

  const rowActionButtonStyle: CSSProperties = {
    ...newExperienceButtonStyle,
    padding: '8px 12px',
    fontSize: '0.78rem',
    letterSpacing: '0.02em',
  };

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
        .select(`id,title,occurred_at,notes,meq30_responses(complete_mystical,language,answers)`)
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
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://app.meq-30.com").replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: `${siteUrl}/fa/auth/callback?redirect=/fa/journal` },
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
      <div style={{ marginTop: '-40px', marginBottom: '-40px' }}>
        <section className="full-bleed-section section-gray" >
          <div className="section-inner narrow">
            <h1 style={{ marginBottom: '2rem' }}>دفترچه تجربه‌های من</h1>

            <div style={{ padding: '2rem', background: '#ffffff' }}>
              <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
               ما از روش احراز هویت بدون رمز عبور استفاده می‌کنیم. در این روش، یک لینک منحصر‌به‌فرد، با مدت اعتبار محدود و قابل استفاده تنها یک‌بار، به صندوق ایمیل شما ارسال می‌شود تا هویت شما تأیید شود. برای ثبت‌نام یا ورود، تنها به یک آدرس ایمیل معتبر نیاز دارید.
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
                  style={newExperienceButtonStyle}
                >
                  ارسال لینک
                </button>
              </div>
              {loginMessage && <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>{loginMessage}</p>}
            </div>
          </div>
        </section>

        <section className="full-bleed-section journal-intro" style={{ background: '#f3f3f2' }}>
          <div className="section-inner narrow" style={{ color: '#4a4a43' }}>
            <h2 className="journal-intro-title" style={{ marginBottom: '1.75rem' }}>ارزیابی MEQ-30 و دفترچه تجربه چیست؟</h2>
            <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '1.75rem', color: '#4a4a43' }}>
              دفترچه‌ای که در اینجا می‌بینید فضایی امن و خصوصی است که برای کمک به تأمل درباره تجربه‌های شخصی شما و شناخت بیشتر آن‌ها با استفاده از MEQ-30 طراحی شده است. در این دفترچه می‌توانید تجربه‌های خود را ثبت کنید، پرسشنامه را تکمیل کنید، و تفسیر مبتنی بر پژوهش را درباره این‌که تجربه شما تا چه اندازه با چهار بُعد تجربه عرفانی هم‌خوانی دارد مشاهده کنید.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, color: '#4a4a43' }}>
              این ابزار یک وسیله تشخیصی، ارزیابی درمانی، یا داوری درباره ارزش یا معنای تجربه شما نیست. تجربه‌ها می‌توانند به شیوه‌های گوناگون عمیق و معنادار باشند، حتی اگر مطابق با معیارهای پژوهشیِ «تجربه عرفانی» قرار نگیرند. هدف این دفترچه کمک به تأمل، فهم بهتر، و توصیف دقیق تجربه‌ها است؛ نه صرفاً طبقه‌بندی آن‌ها.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '-40px', marginBottom: '-40px' }}>
      {pendingExists && (
        <section className="full-bleed-section section-gray">
          <div className="section-inner narrow">
            <div style={{ padding: '1.5rem', background: '#ffffff' }}>
              <p style={{ marginBottom: '1rem' }}>شما یک تجربهٔ ذخیره‌نشده دارید.</p>
              <button
                onClick={() => (window.location.href = "/fa/journal/new?loadPending=1")}
                style={newExperienceButtonStyle}
              >
                مشاهده / ویرایش ذخیره‌نشده
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="full-bleed-section section-gray">
        <div className="section-inner narrow">
          <h1 style={{ margin: 0, textAlign: 'center' }}>دفترچه تجربه‌های من</h1>
        </div>
      </section>

      <section className="full-bleed-section section-white">
        <div className="section-inner narrow">
        </div>
      </section>

      <section className="full-bleed-section section-white" style={{ paddingTop: 0 }}>
        <div className="section-inner narrow">
          <div className="main-page-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>تجربه‌های ثبت‌شده</h2>
            <Link href="/fa/journal/new" className="main-page-link-button">
              + تجربه جدید
            </Link>
          </div>
        {experiences === null ? (
          <p>در حال بارگذاری...</p>
        ) : experiences.length === 0 ? (
          <p>هنوز تجربه‌ای ثبت نشده. <Link href="/fa/journal/new" style={{ textDecoration: 'underline', color: '#3d3d3d' }}>ثبت تجربه</Link>.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table className="journal-table">
            <thead>
              <tr style={{ borderBottom: '2px solid #3d3d3d' }}>
                <th style={{ padding: '12px 8px', textAlign: 'right', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("title")}>
                  عنوان{renderSortIndicator("title")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("occurred_at")}>
                  تاریخ تجربه{renderSortIndicator("occurred_at")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'right', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("complete_mystical")}>
                  عرفانی؟{renderSortIndicator("complete_mystical")}
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
                const answeredCount = resp?.answers ? Object.keys(resp.answers).length : 0;
                const mysticalCell = !resp
                  ? "—"
                  : answeredCount < 30
                    ? "نامشخص"
                    : resp.complete_mystical
                      ? "بله"
                      : "خیر";
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <Link style={{ color: '#3d3d3d', textDecoration: 'underline' }} href={`/${entryLang}/journal/review?id=${e.id}`}>
                        {e.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{persianDateOfExperience}</td>
                    <td style={{ padding: '12px 8px' }}>{mysticalCell}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <button className="row-action-btn" style={rowActionButtonStyle} onClick={() => handleEdit(e.id)}>
                        ویرایش
                      </button>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button className="row-action-btn" style={rowActionButtonStyle} onClick={() => handleDelete(e.id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
        </div>
      </section>

      <section className="full-bleed-section journal-intro" style={{ background: '#f3f3f2' }}>
        <div className="section-inner narrow" style={{ color: '#4a4a43' }}>
          <h2 className="journal-intro-title" style={{ marginBottom: '1.75rem' }}>ارزیابی MEQ-30 و دفترچه تجربه چیست؟</h2>
          <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '1.75rem', color: '#4a4a43' }}>
            دفترچه‌ای که در اینجا می‌بینید فضایی امن و خصوصی است که برای کمک به تأمل درباره تجربه‌های شخصی شما و شناخت بیشتر آن‌ها با استفاده از MEQ-30 طراحی شده است. در این دفترچه می‌توانید تجربه‌های خود را ثبت کنید، پرسشنامه را تکمیل کنید، و تفسیر مبتنی بر پژوهش را درباره این‌که تجربه شما تا چه اندازه با چهار بُعد تجربه عرفانی هم‌خوانی دارد مشاهده کنید.
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, color: '#4a4a43' }}>
            این ابزار یک وسیله تشخیصی، ارزیابی درمانی، یا داوری درباره ارزش یا معنای تجربه شما نیست. تجربه‌ها می‌توانند به شیوه‌های گوناگون عمیق و معنادار باشند، حتی اگر مطابق با معیارهای پژوهشیِ «تجربه عرفانی» قرار نگیرند. هدف این دفترچه کمک به تأمل، فهم بهتر، و توصیف دقیق تجربه‌ها است؛ نه صرفاً طبقه‌بندی آن‌ها.
          </p>
        </div>
      </section>
    </div>
  );
}
