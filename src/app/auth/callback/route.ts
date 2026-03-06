import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirect = url.searchParams.get("redirect");

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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await supabase.auth.signOut({ scope: "others" });
    }
  }

  let redirectTo = redirect;
  if (!redirectTo) {
    const { data } = await supabase.auth.getUser();
    const md = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
    const defaultLanguage =
      typeof md.default_language === "string" ? md.default_language : undefined;
    const lang = defaultLanguage === "fa" ? "fa" : "en";
    redirectTo = `/${lang}/journal`;
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
