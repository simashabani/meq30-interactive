"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { getPendingExperience, clearPendingExperience } from "@/lib/pendingExperience";

export default function JournalPageFa() {
  const [email, setEmail] = useState<string | null>(null);
  const [pendingExists, setPendingExists] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/fa/login";
      } else {
        setEmail(data.user.email);
      }
    });

    const pending = getPendingExperience();
    if (pending) setPendingExists(true);
  }, []);

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

        {pendingExists && (
          <div className="ml-auto border rounded p-3 bg-yellow-50">
            <p className="text-sm">شما یک تجربهٔ ذخیره‌نشده دارید.</p>
            <div className="mt-2">
              <button
                onClick={() => (window.location.href = "/fa/journal/new?loadPending=1")}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                مشاهده / ویرایش ذخیره‌نشده
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
