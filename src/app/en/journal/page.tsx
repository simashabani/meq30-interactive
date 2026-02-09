"use client";

import { useEffect, useState } from "react";
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

  if (!authChecked) return <p>Loading...</p>;

  if (!userId) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">My Experience Journal</h1>
        <p className="mb-4">Please sign in or create an account to view your journal.</p>
        <Link href="/en/login" className="inline-block px-4 py-2 rounded bg-black text-white">
          Login / Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">My Experience Journal</h1>
      <p className="text-sm">Welcome, {email}</p>

      <div className="flex items-center gap-3">
        <Link
          href="/en/journal/new"
          className="inline-block px-4 py-2 rounded bg-black text-white"
        >
          New Experience
        </Link>
        <Link href="/en" className="text-sm underline">
          ← Back
        </Link>
      </div>

      {pendingExists && (
        <div className="border rounded p-3 bg-yellow-50">
          <p className="text-sm">You have an unsaved experience.</p>
          <div className="mt-2">
            <button
              onClick={() => (window.location.href = "/en/journal/new?loadPending=1")}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              View / Edit Unsaved
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold">My Logged Experiences</h2>
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
                <th className="border-b py-2">Edit</th>
                <th className="border-b py-2">Delete</th>
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
                  <tr key={e.id}>
                    <td className="py-2 border-b">
                      <Link className="text-blue-600 underline" href={`/${entryLang}/journal/review?id=${e.id}`}>
                        {e.title}
                      </Link>
                    </td>
                    <td className="py-2 border-b">{dateOfExp}</td>
                    <td className="py-2 border-b">{resp ? (resp.complete_mystical ? "Yes" : "No") : "—"}</td>
                    <td className="py-2 border-b">
                      <button className="text-blue-600 underline" onClick={() => handleEdit(e.id)}>
                        Edit
                      </button>
                    </td>
                    <td className="py-2 border-b">
                      <button className="text-red-600 underline" onClick={() => handleDelete(e.id)}>
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
    </div>
  );
}
