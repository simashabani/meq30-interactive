import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect");
  const safeRedirect = redirect && redirect.startsWith("/") ? redirect : "/en/journal";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  if (!code) {
    const failUrl = new URL("/en/auth/status", url.origin);
    failUrl.searchParams.set("auth_error", "missing_code");
    failUrl.searchParams.set("redirect", safeRedirect);
    return NextResponse.redirect(failUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const failUrl = new URL("/en/auth/status", url.origin);
    failUrl.searchParams.set("auth_error", "exchange_failed");
    failUrl.searchParams.set("redirect", safeRedirect);
    return NextResponse.redirect(failUrl);
  }

  await supabase.auth.signOut({ scope: "others" });

  const statusUrl = new URL("/en/auth/status", url.origin);
  statusUrl.searchParams.set("redirect", safeRedirect);

  return NextResponse.redirect(statusUrl);
}
