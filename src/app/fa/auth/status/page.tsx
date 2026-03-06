"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type StatusState = "checking" | "error";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function FaAuthStatusPage() {
  const [status, setStatus] = useState<StatusState>("checking");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const params = new URLSearchParams(window.location.search);
      const rawRedirect = params.get("redirect");
      const redirectTo =
        rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : "/fa/journal";
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
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "56px 20px 72px", direction: "rtl", textAlign: "right" }}>
      {status === "checking" ? (
        <section>
          <h1 style={{ fontSize: 30, marginBottom: 12 }}>در حال ورود…</h1>
          <p style={{ fontSize: 16, color: "#4a4a43", lineHeight: 1.8 }}>
            لطفاً چند لحظه صبر کنید تا ورود شما کامل شود.
          </p>
        </section>
      ) : (
        <section>
          <h1 style={{ fontSize: 30, marginBottom: 16 }}>ورود شما کامل نشد.</h1>
          <p style={{ fontSize: 16, color: "#4a4a43", lineHeight: 1.9, marginBottom: 16 }}>
            ممکن است اعتبار این لینک تمام شده باشد، قبلاً استفاده شده باشد، یا لینک جدیدتری برای شما ارسال شده باشد.
            لطفاً چند دقیقه صبر کنید و دوباره یک لینک جدید درخواست کنید.
            برای اطمینان، فقط از جدیدترین ایمیل استفاده کنید.
          </p>
          {authError && (
            <p style={{ fontSize: 13, color: "#777", marginBottom: 16 }}>
              کد خطا: {authError}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <a
              href="/fa/login"
              style={{
                textDecoration: "none",
                background: "#3d3d3d",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 0,
                fontSize: 14,
              }}
            >
              بازگشت به صفحه ورود
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
