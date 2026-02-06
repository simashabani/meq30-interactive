"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function HomeEn() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <div>
      <h1>MEQ-30 Interactive</h1>

      {email ? (
  <p>
    Logged in as <b>{email}</b>{" "}
    <button
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        location.reload();
      }}
    >
      Logout
    </button>
  </p>
) : (
  <p>
    Not logged in. <Link href="/en/login">Login</Link>
  </p>
)}


      <ul>
        <li><Link href="/en/about">About</Link></li>
        <li><Link href="/en/privacy">Privacy</Link></li>
	<li><Link href="/en/journal">My Mystical Experiences</Link></li>
        <li><Link href="/fa">فارسی</Link></li>
      </ul>
    </div>
  );
}
