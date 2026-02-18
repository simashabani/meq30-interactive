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
  const [showUserMenu, setShowUserMenu] = useState(false);

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
        {/* Left navigation */}
        <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a
            href={isFa ? "https://meq-30.com/homepersian" : "https://meq-30.com/"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isFa ? "خانه" : "MEQ-30 Home"}
          </a>
          <Link href={isFa ? "/fa/journal" : "/en/journal"} style={{ fontWeight: 700 }}>
            {isFa ? "دفتر تجربه‌های من" : "My Experience Journal"}
          </Link>
        </nav>

        {/* Right navigation */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* Language toggle */}
          <button
            onClick={() => window.location.href = isFa ? "/en" : "/fa"}
            style={{
              border: "1px solid #e5e7eb",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 14,
              background: "white",
              cursor: "pointer",
            }}
          >
            {isFa ? "English" : "فارسی"}
          </button>

          {/* User menu */}
          {userEmail ? (
            <div style={{ position: "relative" }}>
              <button
                style={{
                  fontSize: 13,
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "6px 10px",
                  background: "white",
                  cursor: "pointer",
                }}
                onClick={() => setShowUserMenu((v) => !v)}
              >
                {userEmail}
              </button>
              {showUserMenu && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    minWidth: 180,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    zIndex: 20,
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <b>{isFa ? "ایمیل" : "Email"}:</b> {userEmail}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <b>{isFa ? "زبان پیش‌فرض" : "Default Language"}:</b>
                    <select
                      value={prefLang || (isFa ? "fa" : "en")}
                      onChange={(e) => setPrefLang(e.target.value as "en" | "fa")}
                      style={{ padding: "6px", borderRadius: 6, marginLeft: 6 }}
                    >
                      <option value="en">English</option>
                      <option value="fa">فارسی</option>
                    </select>
                    <button
                      onClick={() => savePreference(prefLang === "fa" ? "fa" : "en")}
                      disabled={saving}
                      style={{ padding: "6px 10px", borderRadius: 6, marginLeft: 6 }}
                    >
                      {saving ? "..." : isFa ? "ذخیره" : "Save"}
                    </button>
                  </div>
                  <button
                    onClick={async () => {
                      const supabase = createSupabaseBrowserClient();
                      await supabase.auth.signOut();
                      window.location.href = isFa ? "/fa" : "/en";
                    }}
                    style={{ padding: "6px 10px", borderRadius: 6, background: "#f3f4f6", width: "100%" }}
                  >
                    {isFa ? "خروج" : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={isFa ? "/fa/login" : "/en/login"}>
              {isFa ? "ورود/ثبت‌نام" : "Login/Sign Up"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
