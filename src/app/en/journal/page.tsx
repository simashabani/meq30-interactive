"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

export default function JournalPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/en/login";
      } else {
        setEmail(data.user.email);
      }
    });
  }, []);

  if (!email) return <p>Loading...</p>;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Journal</h1>
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
    </main>
  );
}
