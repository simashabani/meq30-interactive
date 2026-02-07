import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

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
    await supabase.auth.exchangeCodeForSession(code);
  }
  // After exchanging code, check user's preferred language in metadata and redirect accordingly
  try {
    const { data: userData } = await supabase.auth.getUser();
    const lang = (userData?.user?.user_metadata as any)?.language || (userData?.user?.user_metadata as any)?.lang;
    if (lang === "fa") {
      return NextResponse.redirect(new URL("/fa", url.origin));
    }
  } catch (err) {
    // ignore and fall back to English
  }

  return NextResponse.redirect(new URL("/en", url.origin));
}
