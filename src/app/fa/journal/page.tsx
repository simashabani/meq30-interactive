"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";

export default function JournalPageFa() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/fa/login";
      } else {
        setEmail(data.user.email);
      }
    });
  }, []);

  if (!email) return <p>در حال بارگذاری...</p>;

  return (
    <main dir="rtl" className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">دفتر خاطرات</h1>
      <p className="text-sm">خوش آمدید، {email}</p>

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
    </main>
  );
}
