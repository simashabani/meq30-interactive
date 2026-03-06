"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type StatusState = "checking" | "error";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function FaAuthStatusPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusState>("checking");

  const authError = searchParams.get("auth_error");
  const redirectTo = useMemo(() => {
    const raw = searchParams.get("redirect");
    return raw && raw.startsWith("/") ? raw : "/fa/journal";
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
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-start" }}>
            <a
              href="/fa/login?mode=resend"
              style={{
                textDecoration: "none",
                background: "#3d3d3d",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              ارسال لینک جدید
            </a>
            <a
              href="/fa/login"
              style={{
                textDecoration: "none",
                border: "1px solid #d4d8cd",
                color: "#3d3d3d",
                padding: "10px 14px",
                borderRadius: 6,
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
