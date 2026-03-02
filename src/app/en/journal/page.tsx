"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { getPendingExperience, savePendingExperience } from "@/lib/pendingExperience";

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

export default function JournalPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<any[] | null>(null);
  const [pendingExists, setPendingExists] = useState(false);
  const [sortBy, setSortBy] = useState<{ column: string; ascending: boolean }>({ column: "occurred_at", ascending: false });
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [defaultLanguage, setDefaultLanguage] = useState<"en" | "fa">("en");
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
      alert("Failed to load experience for editing");
      return;
    }

    const { data: respData, error: respErr } = await supabase
      .from("meq30_responses")
      .select("language,answers,mystical_percentage,positive_mood_percentage,time_space_percentage,ineffability_percentage,complete_mystical")
      .eq("experience_id", experienceId)
      .single();

    if (respErr || !respData) {
      alert("No MEQ response found for this experience.");
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
    if (!confirm("Delete this experience?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("meq30_responses").delete().eq("experience_id", experienceId);
    const { error } = await supabase.from("experiences").delete().eq("id", experienceId);
    if (error) {
      alert("Failed to delete experience.");
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
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://wp.meq-30.com").replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: `${siteUrl}/en/auth/callback?redirect=/en/journal` },
    });
    setLoginMessage(error ? error.message : "Check your email for the login link.");
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/en/journal";
  };

  if (!authChecked) return <p>Loading...</p>;

  if (!userId) {
    return (
      <>
        <section className="full-bleed-section section-gray">
          <div className="section-inner narrow">
            <h1 style={{ marginBottom: '2rem' }}>My Experience Journal</h1>

            <div style={{ padding: '2rem', background: '#ffffff' }}>
              <p style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
                We use a passwordless authentication method that delivers a unique, time-limited, and one-time-use URL to your inbox to verify your identity. All you need to sign up or log in is a valid email address.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '10px 12px', border: '1px solid #ddd', fontSize: '1rem' }}
                  placeholder="Email"
                />
                <button
                  onClick={handleLogin}
                  style={newExperienceButtonStyle}
                >
                  Send the Link
                </button>
              </div>
              {loginMessage && <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>{loginMessage}</p>}
            </div>
          </div>
        </section>

        <section className="full-bleed-section journal-intro" style={{ background: 'var(--charcoal)' }}>
          <div className="section-inner narrow" style={{ color: '#ffffff' }}>
            <h2 className="journal-intro-title" style={{ marginBottom: '1.75rem' }}>WHAT IS MEQ-30 ASSESSMENT AND EXPERIENCE JOURNAL?</h2>
            <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '1.75rem', color: '#ffffff' }}>
              The journal you see here is a secure, private space designed to help you reflect on and learn more about your own experiences using the MEQ-30. It allows you to record experiences, complete the questionnaire, and view a research-informed interpretation of how your experience aligns with the four mystical experience dimensions.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, color: '#ffffff' }}>
              This tool is not a diagnostic instrument, a therapeutic assessment, or a judgment about the value or meaning of your experience. Experiences can be deeply significant in many ways, whether or not they meet formal research conventions for a “Mystical Experience”. The purpose of this journal is reflection, understanding, and careful description; not classification for its own sake.
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="full-bleed-section section-gray">
        <div className="section-inner narrow">
          <div style={{ padding: '1.5rem', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p>Welcome, {email}</p>
            <button
              onClick={handleLogout}
              style={newExperienceButtonStyle}
            >
              Log off
            </button>
          </div>

          {pendingExists && (
            <div style={{ padding: '1.5rem', marginTop: '1.25rem', background: '#ffffff' }}>
              <p style={{ marginBottom: '1rem' }}>You have an unsaved experience.</p>
              <button
                onClick={() => (window.location.href = "/en/journal/new?loadPending=1")}
                style={newExperienceButtonStyle}
              >
                View / Edit Unsaved
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="full-bleed-section journal-intro" style={{ background: 'var(--charcoal)' }}>
        <div className="section-inner narrow" style={{ color: '#ffffff' }}>
          <h2 className="journal-intro-title" style={{ marginBottom: '1.75rem' }}>WHAT IS MEQ-30 ASSESSMENT AND EXPERIENCE JOURNAL?</h2>
          <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '1.75rem', color: '#ffffff' }}>
            The journal you see here is a secure, private space designed to help you reflect on and learn more about your own experiences using the MEQ-30. It allows you to record experiences, complete the questionnaire, and view a research-informed interpretation of how your experience aligns with the four mystical experience dimensions.
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, color: '#ffffff' }}>
            This tool is not a diagnostic instrument, a therapeutic assessment, or a judgment about the value or meaning of your experience. Experiences can be deeply significant in many ways, whether or not they meet formal research conventions for a “Mystical Experience”. The purpose of this journal is reflection, understanding, and careful description; not classification for its own sake.
          </p>
        </div>
      </section>

      <section className="full-bleed-section section-white">
        <div className="section-inner narrow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 style={{ margin: 0 }}>My Experience Journal</h1>
            <Link
              href="/en/journal/new"
              style={newExperienceButtonStyle}
            >
              + New Experience
            </Link>
          </div>
        </div>
      </section>

      <section className="full-bleed-section section-white">
        <div className="section-inner narrow">
          <h2 style={{ marginBottom: '1.5rem' }}>My Logged Experiences</h2>
        {experiences === null ? (
          <p>Loading...</p>
        ) : experiences.length === 0 ? (
          <p>No experiences found. <Link href="/en/journal/new" style={{ textDecoration: 'underline', color: '#3d3d3d' }}>Log one</Link>.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #3d3d3d' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("title")}>
                  Name{renderSortIndicator("title")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("occurred_at")}>
                  Date of Experience{renderSortIndicator("occurred_at")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }} onClick={() => handleSort("complete_mystical")}>
                  Mystical?{renderSortIndicator("complete_mystical")}
                </th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 600 }}>Edit</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 600 }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((e: any) => {
                const resp = Array.isArray(e.meq30_responses) ? e.meq30_responses[0] : e.meq30_responses;
                const entryLang = resp?.language === "fa" ? "fa" : "en";
                const dateOfExp = e.occurred_at
                  ? new Date(e.occurred_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      timeZone: "UTC",
                    })
                  : "—";
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <Link style={{ color: '#3d3d3d', textDecoration: 'underline' }} href={`/${entryLang}/journal/review?id=${e.id}`}>
                        {e.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{dateOfExp}</td>
                    <td style={{ padding: '12px 8px' }}>{resp ? (resp.complete_mystical ? "Yes" : "No") : "—"}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <button style={newExperienceButtonStyle} onClick={() => handleEdit(e.id)}>
                        Edit
                      </button>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button style={newExperienceButtonStyle} onClick={() => handleDelete(e.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        </div>
      </section>
    </>
  );
}
