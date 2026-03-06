"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function FaLoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);

  const isResend = searchParams.get("mode") === "resend";

  const handleLogin = async () => {
    if (!email.trim() || sending) return;

    setSending(true);
    const supabase = createSupabaseBrowserClient();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://app.meq-30.com").replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${siteUrl}/fa/auth/callback?lang=fa` },
    });

    if (error) {
      setMessageType("error");
      setMessage(error.message);
      setSending(false);
      return;
    }

    setMessageType("success");
    setEmailSent(true);
    setSending(false);
  };

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px 72px", direction: "rtl", textAlign: "right" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>ورود</h1>
      {isResend && (
        <p style={{ marginTop: 0, marginBottom: 14, color: "#5d5f56", lineHeight: 1.8 }}>
          لطفاً یک لینک ورود جدید درخواست کنید.
        </p>
      )}

      {emailSent ? (
        <section>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>ایمیل خود را بررسی کنید</h2>
          <p style={{ lineHeight: 1.9, color: "#4a4a43" }}>
            یک لینک امن برای ورود به ایمیل شما ارسال شد.
            لطفاً از جدیدترین ایمیل استفاده کنید.
            اگر لینک عمل نکرد، چند دقیقه صبر کنید و دوباره درخواست بدهید.
          </p>
        </section>
      ) : (
        <section>
          <label htmlFor="fa-login-email" style={{ display: "block", marginBottom: 8, color: "#505248" }}>
            ایمیل
          </label>
          <input
            id="fa-login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{ width: "100%", border: "1px solid #cfd3ca", borderRadius: 6, padding: "10px 12px", marginBottom: 10 }}
          />
          <p style={{ marginTop: 0, marginBottom: 14, color: "#66685f", fontSize: 13, lineHeight: 1.8 }}>
            فقط از جدیدترین ایمیل ورود استفاده کنید. لینک‌های قبلی ممکن است دیگر معتبر نباشند.
          </p>
          <button
            type="button"
            onClick={handleLogin}
            disabled={sending}
            style={{ border: "none", background: "#3d3d3d", color: "#fff", padding: "10px 14px", borderRadius: 6, cursor: sending ? "default" : "pointer" }}
          >
            {sending ? "در حال ارسال..." : "ارسال لینک ورود"}
          </button>
        </section>
      )}

      {message && (
        <p style={{ marginTop: 14, color: messageType === "error" ? "#c43737" : "#6f7a2a", lineHeight: 1.8 }}>
          {message}
        </p>
      )}
    </main>
  );
}
