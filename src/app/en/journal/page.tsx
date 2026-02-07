"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { getPendingExperience, clearPendingExperience } from "@/lib/pendingExperience";

export default function JournalPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [pendingExists, setPendingExists] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/en/login";
      } else {
        setEmail(data.user.email);
      }
    });

    const pending = getPendingExperience();
    if (pending) setPendingExists(true);
  }, []);

  if (!email) return <p>Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Journal</h1>
      <p className="text-sm">Welcome, {email}</p>

      <div className="flex items-center gap-3">
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
          <div className="ml-auto border rounded p-3 bg-yellow-50">
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
      </div>
    </main>
  );
}
