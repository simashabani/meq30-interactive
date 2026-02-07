"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Props = {
  locale: "en" | "fa";
};

export default function Header({ locale }: Props) {
  const isFa = locale === "fa";
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [prefLang, setPrefLang] = useState<"en" | "fa" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || null);
        const meta = (data.user.user_metadata as any) || {};
        if (meta.language === "fa" || meta.lang === "fa") setPrefLang("fa");
        else if (meta.language === "en" || meta.lang === "en") setPrefLang("en");
      }
    });
  }, []);

  async function savePreference(lang: "en" | "fa") {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ data: { language: lang } });
      if (error) throw error;
      setPrefLang(lang);
      // redirect to that locale root
      window.location.href = lang === "fa" ? "/fa" : "/en";
    } catch (err: any) {
      alert("خطا در ذخیره‌سازی: " + (err?.message || String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "14px 18px",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link href={isFa ? "/fa" : "/en"} style={{ fontWeight: 700 }}>
          {isFa ? "MEQ-30 تعاملی" : "MEQ-30 Interactive"}
        </Link>

        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href={isFa ? "/fa/about" : "/en/about"}>
            {isFa ? "درباره" : "About"}
          </Link>
          <Link href={isFa ? "/fa/privacy" : "/en/privacy"}>
            {isFa ? "حریم خصوصی" : "Privacy"}
          </Link>

          {/* Language toggle (quick switch) */}
          <Link
            href={isFa ? "/en" : "/fa"}
            style={{
              border: "1px solid #e5e7eb",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {isFa ? "English" : "فارسی"}
          </Link>

          {userEmail ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#374151" }}>{userEmail}</span>
              <select
                value={prefLang || (isFa ? "fa" : "en")}
                onChange={(e) => setPrefLang(e.target.value as "en" | "fa")}
                style={{ padding: "6px", borderRadius: 6 }}
              >
                <option value="en">English</option>
                <option value="fa">فارسی</option>
              </select>
              <button
                onClick={() => savePreference(prefLang === "fa" ? "fa" : "en")}
                disabled={saving}
                style={{ padding: "6px 10px", borderRadius: 6 }}
              >
                {saving ? "..." : isFa ? "ذخیره" : "Save"}
              </button>
            </div>
          ) : (
            <Link href={isFa ? "/fa/login" : "/en/login"}>{isFa ? "ورود" : "Login"}</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
