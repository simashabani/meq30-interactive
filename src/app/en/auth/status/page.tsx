"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type StatusState = "checking" | "error";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function EnAuthStatusPage() {
  const [status, setStatus] = useState<StatusState>("checking");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const params = new URLSearchParams(window.location.search);
      const rawRedirect = params.get("redirect");
      const redirectTo =
        rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : "/en/journal";
      const detectedError = params.get("auth_error");
      setAuthError(detectedError);

      if (detectedError) {
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
  }, []);

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
          <div style={{ display: "flex" }}>
            <a
              href="/en/login"
              style={{
                textDecoration: "none",
                background: "#3d3d3d",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 0,
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
