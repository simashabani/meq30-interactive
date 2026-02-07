"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { savePendingExperience } from "@/lib/pendingExperience";

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

export default function HomeEn() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<any[] | null>(null);
  const [sortBy, setSortBy] = useState<{ column: string; ascending: boolean }>({ column: "updated_at", ascending: false });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    (async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select(
          `id,title,occurred_at,updated_at,notes,meq30_responses(complete_mystical)`
        )
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
    // fetch experience and response
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

    // build pending shape
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

  return (
    <div>
      <h1>MEQ-30 Interactive</h1>

      {email ? (
        <div>
          <p>
            Logged in as <b>{email}</b>{" "}
            <button
              onClick={async () => {
                const supabase = createSupabaseBrowserClient();
                await supabase.auth.signOut();
                location.reload();
              }}
            >
              Logout
            </button>
          </p>

          {/* Experiences table */}
          <h2 className="mt-4 text-lg font-semibold">My Logged Experiences</h2>
          {experiences === null ? (
            <p>Loading...</p>
          ) : experiences.length === 0 ? (
            <p>No experiences found. <Link href="/en/journal/new">Log one</Link>.</p>
          ) : (
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("title")}>
                    Name{renderSortIndicator("title")}
                  </th>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("occurred_at")}>
                    Date of Experience{renderSortIndicator("occurred_at")}
                  </th>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("complete_mystical")}>
                    Mystical?{renderSortIndicator("complete_mystical")}
                  </th>
                  <th className="border-b py-2 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updated_at")}>
                    Saved At{renderSortIndicator("updated_at")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((e: any) => {
                  // meq30_responses may be an array of rows
                  const resp = Array.isArray(e.meq30_responses) ? e.meq30_responses[0] : e.meq30_responses;
                  const dateOfExp = e.occurred_at ? new Date(e.occurred_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : "—";
                  const savedAtDate = new Date(e.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
                  return (
                    <tr key={e.id}>
                      <td className="py-2 border-b">
                        <button className="text-blue-600 underline" onClick={() => handleEdit(e.id)}>
                          {e.title}
                        </button>
                      </td>
                      <td className="py-2 border-b">{dateOfExp}</td>
                      <td className="py-2 border-b">{resp ? (resp.complete_mystical ? "Yes" : "No") : "—"}</td>
                      <td className="py-2 border-b">{savedAtDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p>
          Not logged in. <Link href="/en/login">Login</Link>
        </p>
      )}


      <ul>
        <li><Link href="/en/about">About</Link></li>
        <li><Link href="/en/privacy">Privacy</Link></li>
	<li><Link href="/en/journal">My Mystical Experiences</Link></li>
        <li><Link href="/fa">فارسی</Link></li>
      </ul>
    </div>
  );
}
