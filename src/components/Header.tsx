"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Props = {
  locale: "en" | "fa";
};

export default function Header({ locale }: Props) {
  const isFa = locale === "fa";
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSendLink() {
    if (!loginEmail.trim()) return;
    const supabase = createSupabaseBrowserClient();
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://app.meq-30.com").replace(/\/$/, "");
    const localePath = isFa ? "/fa" : "/en";

    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail.trim(),
      options: {
        emailRedirectTo: `${siteUrl}${localePath}/auth/callback?redirect=${localePath}/journal`,
      },
    });

    setLoginMessage(
      error
        ? error.message
        : isFa
          ? "لطفاً ایمیل خود را بررسی کنید."
          : "Check your email."
    );
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    window.location.href = isFa ? "/fa/journal" : "/en/journal";
  }

  const userMenu = (
    <div className="user-menu-wrap" ref={menuRef}>
      <button
        type="button"
        className={`user-menu-trigger ${email ? "logged-in" : "logged-out"}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={isFa ? "منوی کاربر" : "User menu"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
        </svg>
      </button>

      {menuOpen && (
        <div className={`user-menu-dropdown ${isFa ? "fa" : "en"}`}>
          {!authChecked ? (
            <p className="user-menu-line">{isFa ? "در حال بارگذاری..." : "Loading..."}</p>
          ) : email ? (
            <>
              <p className="user-menu-line user-menu-email">
                {isFa ? "ورود با" : "Logged in as"} {email}
              </p>
              <a href={isFa ? "/fa/user-info" : "/en/user-info"} className="user-menu-link">
                {isFa ? "اطلاعات کاربر" : "User Information"}
              </a>
              <button type="button" className="user-menu-link user-menu-action" onClick={handleLogout}>
                {isFa ? "خروج" : "Log out"}
              </button>
            </>
          ) : (
            <>
              <input
                className="user-menu-input"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder={isFa ? "ایمیل" : "Email"}
              />
              <button type="button" className="user-menu-auth-button" onClick={handleSendLink}>
                {isFa ? "ورود / ثبت‌نام" : "Log In / Sign Up"}
              </button>
              {loginMessage && <p className="user-menu-msg">{loginMessage}</p>}
              <p className="user-menu-note">
                {isFa
                  ? "ما از روش احراز هویت بدون رمز عبور استفاده می‌کنیم که یک لینک یکتا، محدود به زمان و یک‌بارمصرف به ایمیل شما ارسال می‌کند. برای ثبت‌نام یا ورود فقط به یک ایمیل معتبر نیاز دارید."
                  : "We use a passwordless authentication method that delivers a unique, time-limited, and one-time-use URL to your inbox to verify your identity. All you need to sign up or log in is a valid email address."}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="meq-header">
      <style jsx>{`
  .meq-header {
    border-bottom: 1px solid #e5e7eb;
    padding: 16px 80px;
    position: sticky;
    top: 0;
    background: white;
    z-index: 9999;
  }

  .meq-mini-nav {
    font-family: ${
      isFa
        ? "'IranSansRegularLocal', Tahoma, Arial, sans-serif"
        : "'Nunito', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    };
    direction: ${isFa ? "rtl" : "ltr"};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 14px 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    max-width: 1200px;           /* website look */
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .meq-header {
      padding: 12px 28px;
    }

    .meq-mini-nav {
      gap: 14px;
      padding: 10px 0;
    }
  }

  .meq-mini-nav .left,
  .meq-mini-nav .right {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }

  .user-menu-wrap {
    position: relative;
  }

  .user-menu-trigger {
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
  }

  .user-menu-trigger svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
  }

  .user-menu-trigger.logged-in {
    color: #828b2c;
  }

  .user-menu-trigger.logged-out {
    color: #8c8c7e;
  }

  .user-menu-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    width: 310px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    padding: 12px;
    z-index: 10000;
    text-transform: none;
    letter-spacing: normal;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .user-menu-dropdown.en {
    right: 0;
    direction: ltr;
    text-align: left;
  }

  .user-menu-dropdown.fa {
    left: 0;
    direction: rtl;
    text-align: right;
  }

  .user-menu-line,
  .user-menu-note,
  .user-menu-msg,
  .user-menu-link,
  .user-menu-auth-button,
  .user-menu-input {
    font-size: 12px;
    line-height: 1.5;
  }

  .user-menu-email {
    margin: 0 0 10px;
    color: #4a4a43;
  }

  .user-menu-link {
    display: block;
    margin: 0 0 8px;
    text-decoration: underline;
    color: #4a4a43;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: inherit;
  }

  .user-menu-action {
    margin-bottom: 0;
  }

  .user-menu-input {
    width: 100%;
    border: 1px solid #d1d5db;
    padding: 8px 10px;
    margin-bottom: 8px;
    font-family: inherit;
  }

  .user-menu-auth-button {
    width: 100%;
    border: none;
    background: #3d3d3d;
    color: #ffffff;
    padding: 9px 12px;
    font-family: inherit;
    cursor: pointer;
  }

  .user-menu-msg {
    margin: 8px 0 0;
    color: #4a4a43;
  }

  .user-menu-note {
    margin: 8px 0 0;
    color: #5a5d52;
  }

  .meq-item {
    color: inherit;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding-bottom: 6px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .left .meq-item {
    font-size: 16px;
    font-weight: 400;
  }

  /* Languages: same size, active just bolder + underline */
  .right .meq-item {
    font-size: 12px;
    font-weight: 400;
  }

  a.meq-item {
    cursor: pointer;
  }

  .meq-item::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    bottom: 0;
    transform: translateY(1px);
    opacity: 0;
    transition: opacity 180ms ease;
    background: currentColor;
  }

  a.meq-item:hover::after,
  a.meq-item:focus-visible::after {
    opacity: 1;
  }

  .meq-item.active {
    cursor: default;
    font-weight: 600;
  }

  .meq-item.active::after {
    opacity: 1;
  }

  @media (max-width: 520px) {
    .meq-header {
      padding: 10px 20px;
    }

    .meq-mini-nav {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 0;
    }

    .meq-mini-nav .left {
      flex: 1;
      justify-content: flex-start;
      gap: 12px;
      flex-wrap: nowrap;
    }

    .left .meq-item {
      font-size: 12px;
    }

    .meq-mini-nav .right {
      flex: 0 0 auto;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-start;
      gap: 6px;
      flex-wrap: nowrap;
    }

    .right .meq-item {
      font-size: 10px;
    }

    .meq-item::after {
      transform: translateY(0px);
    }

    .user-menu-dropdown {
      width: 260px;
    }
  }
`}</style>

      <nav className="meq-mini-nav" aria-label="MEQ-30 Navigation">
        <div className="left">
          {isFa && userMenu}

          <a
            className="meq-item"
            href={isFa ? "https://meq-30.com/homepersian" : "https://meq-30.com"}
            target="_top"
            rel="noopener"
          >
            {isFa ? "دربارهٔ MEQ-30" : "About MEQ-30"}
          </a>

          <a
            className="meq-item active"
            href={isFa ? "/fa/journal" : "/en/journal"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isFa ? "خانه" : "Home"}
          </a>
        </div>

        <div className="right">
          {isFa ? (
            <>
              <a
                className="meq-item"
                href="/en/journal"
              >
                انگلیسی
              </a>
              <span className="meq-item active">فارسی</span>
            </>
          ) : (
            <>
              <span className="meq-item active">English</span>
              <a
                className="meq-item"
                href="/fa/journal"
              >
                Persian
              </a>
            </>
          )}
          {!isFa && userMenu}
        </div>
      </nav>
    </header>
  );
}
