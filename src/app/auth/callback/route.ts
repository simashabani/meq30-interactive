import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect");
  const requestedLang = url.searchParams.get("lang");

  const safeRedirect = redirect && redirect.startsWith("/") ? redirect : undefined;
  let locale: "en" | "fa" = requestedLang === "fa" ? "fa" : "en";

  if (safeRedirect?.startsWith("/fa")) {
    locale = "fa";
  }

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
    const failUrl = new URL(`/${locale}/auth/status`, url.origin);
    failUrl.searchParams.set("auth_error", "missing_code");
    failUrl.searchParams.set("redirect", safeRedirect ?? `/${locale}/journal`);
    return NextResponse.redirect(failUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const failUrl = new URL(`/${locale}/auth/status`, url.origin);
    failUrl.searchParams.set("auth_error", "exchange_failed");
    failUrl.searchParams.set("redirect", safeRedirect ?? `/${locale}/journal`);
    return NextResponse.redirect(failUrl);
  }

  await supabase.auth.signOut({ scope: "others" });

  const { data } = await supabase.auth.getUser();
  const md = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
  const defaultLanguage =
    typeof md.default_language === "string" ? md.default_language : undefined;
  locale = defaultLanguage === "fa" ? "fa" : locale;

  const statusUrl = new URL(`/${locale}/auth/status`, url.origin);
  statusUrl.searchParams.set("redirect", safeRedirect ?? `/${locale}/journal`);

  return NextResponse.redirect(statusUrl);
}
