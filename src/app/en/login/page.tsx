"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [isResend, setIsResend] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsResend(params.get("mode") === "resend");
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || sending) return;

    setSending(true);
    const supabase = createSupabaseBrowserClient();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://app.meq-30.com").replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${siteUrl}/en/auth/callback?lang=en` },
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
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px 72px" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Sign in</h1>
      {isResend && (
        <p style={{ marginTop: 0, marginBottom: 14, color: "#5d5f56", lineHeight: 1.7 }}>
          Please request a new sign-in link.
        </p>
      )}

      {emailSent ? (
        <section>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Check your email</h2>
          <p style={{ lineHeight: 1.8, color: "#4a4a43" }}>
            We sent you a secure sign-in link.
            Please use the most recent email we sent.
            If the link does not work, wait a few minutes and request a new one.
          </p>
        </section>
      ) : (
        <section>
          <label htmlFor="en-login-email" style={{ display: "block", marginBottom: 8, color: "#505248" }}>
            Email
          </label>
          <input
            id="en-login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{ width: "100%", border: "1px solid #cfd3ca", borderRadius: 6, padding: "10px 12px", marginBottom: 10 }}
          />
          <p style={{ marginTop: 0, marginBottom: 14, color: "#66685f", fontSize: 13, lineHeight: 1.7 }}>
            Use only the most recent login email. Older links may no longer work.
          </p>
          <button
            type="button"
            onClick={handleLogin}
            disabled={sending}
            style={{ border: "none", background: "#3d3d3d", color: "#fff", padding: "10px 14px", borderRadius: 6, cursor: sending ? "default" : "pointer" }}
          >
            {sending ? "Sending..." : "Send sign-in link"}
          </button>
        </section>
      )}

      {message && (
        <p style={{ marginTop: 14, color: messageType === "error" ? "#c43737" : "#6f7a2a", lineHeight: 1.7 }}>
          {message}
        </p>
      )}
    </main>
  );
}
