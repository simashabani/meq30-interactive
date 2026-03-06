"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type StatusState = "checking" | "error";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function EnAuthStatusPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusState>("checking");

  const authError = searchParams.get("auth_error");
  const redirectTo = useMemo(() => {
    const raw = searchParams.get("redirect");
    return raw && raw.startsWith("/") ? raw : "/en/journal";
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (authError) {
        setStatus("error");
        return;
      }

      const supabase = createSupabaseBrowserClient();

      for (let i = 0; i < 8; i += 1) {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;

        if (data.user) {
          window.location.href = redirectTo;
          return;
        }

        await sleep(700);
      }

      if (!cancelled) {
        setStatus("error");
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [authError, redirectTo]);

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "56px 20px 72px" }}>
      {status === "checking" ? (
        <section>
          <h1 style={{ fontSize: 30, marginBottom: 12 }}>Signing you in…</h1>
          <p style={{ fontSize: 16, color: "#4a4a43", lineHeight: 1.7 }}>
            Please wait while we complete your sign-in.
          </p>
        </section>
      ) : (
        <section>
          <h1 style={{ fontSize: 30, marginBottom: 16 }}>We couldn’t complete your sign-in.</h1>
          <p style={{ fontSize: 16, color: "#4a4a43", lineHeight: 1.8, marginBottom: 16 }}>
            The link may have expired, may already have been used, or a newer login link may have been sent.
            Please wait a few minutes and request a new sign-in link.
            For best results, use only the most recent email.
          </p>
          {authError && (
            <p style={{ fontSize: 13, color: "#777", marginBottom: 16 }}>
              Error code: {authError}
            </p>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="/en/login?mode=resend"
              style={{
                textDecoration: "none",
                background: "#3d3d3d",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              Send a new login link
            </a>
            <a
              href="/en/login"
              style={{
                textDecoration: "none",
                border: "1px solid #d4d8cd",
                color: "#3d3d3d",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              Back to sign in
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
