"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

type Props = {
  locale: "en" | "fa";
};

export default function Header({ locale }: Props) {
  const isFa = locale === "fa";
  const [menuOpen, setMenuOpen] = useState(false);
  const [iconHovered, setIconHovered] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginMessageType, setLoginMessageType] = useState<"success" | "error">("success");
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

    if (error) {
      setLoginMessageType("error");
      setLoginMessage(error.message);
      return;
    }

    setLoginMessageType("success");
    setLoginMessage(
      isFa
        ? "برای دریافت لینک ورود، به ایمیل خود مراجعه کنید."
        : "For login link, check your email."
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
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "8px",
          border: `0.9px solid ${email ? (iconHovered ? "#96a73a" : "#828b2c") : "#4a4a43"}`,
          background: email ? (iconHovered ? "#96a73a" : "#828b2c") : (iconHovered ? "#f7f7f4" : "#ffffff"),
          color: email ? "#ffffff" : "#4a4a43",
          boxShadow: menuOpen ? "0 0 0 2px #4a4a43" : "none",
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          margin: 0,
          lineHeight: 1,
          textTransform: "none",
          letterSpacing: "normal",
          font: "inherit",
          cursor: "pointer",
          opacity: 1,
        }}
        onClick={() => setMenuOpen((prev) => !prev)}
        onMouseEnter={() => setIconHovered(true)}
        onMouseLeave={() => setIconHovered(false)}
        onFocus={() => setIconHovered(true)}
        onBlur={() => setIconHovered(false)}
        aria-label={isFa ? "منوی کاربر" : "User menu"}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.35" />
          <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      </button>

      {menuOpen && (
        <div
          className={`user-menu-dropdown ${isFa ? "fa" : "en"}`}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            width: "320px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
            borderRadius: "14px",
            padding: "12px 14px",
            zIndex: 10001,
            textTransform: "none",
            letterSpacing: "normal",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
            ...(isFa
              ? { right: "6px", direction: "rtl", textAlign: "right" as const }
              : { right: "6px", direction: "ltr", textAlign: "left" as const }),
          }}
        >
          {!authChecked ? (
            <p className="user-menu-line">{isFa ? "در حال بارگذاری..." : "Loading..."}</p>
          ) : email ? (
            <>
              <div className="user-menu-head user-menu-head-logged">
                <p className="user-menu-status">
                  {isFa
                    ? "شما با آدرس ایمیل زیر وارد شده‌اید:"
                    : "You are logged in with the following email address:"}
                </p>
                <p
                  className="user-menu-email user-menu-email-logged"
                  style={{ color: "#828b2c", fontWeight: 700 }}
                >
                  {email}
                </p>
              </div>

              <div className="user-menu-divider" style={{ height: "1px", background: "#e2e5dc", margin: "12px 0" }} />

              <div className="user-menu-language-section" style={{ marginBottom: "0" }}>
                <p className="user-menu-language-title" style={{ marginBottom: "12px" }}>
                  {isFa ? "زبان" : "Language"}
                </p>
                <div
                  className={`user-menu-language-nav ${isFa ? "fa" : "en"}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    direction: isFa ? "rtl" : "ltr",
                    marginBottom: "0",
                  }}
                >
                  {isFa ? (
                    <>
                      <a
                        className="user-menu-language-item"
                        href="/en/journal"
                        style={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#4a4a43",
                          textTransform: "none",
                          letterSpacing: "0.01em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          textDecoration: "underline",
                          textUnderlineOffset: "5px",
                          textDecorationThickness: "1px",
                        }}
                      >
                        انگلیسی
                      </a>
                      <span
                        className="user-menu-language-item active"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#828b2c",
                          textTransform: "none",
                          letterSpacing: "0.01em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        فارسی
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="user-menu-language-item active"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#828b2c",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        English
                      </span>
                      <a
                        className="user-menu-language-item"
                        href="/fa/journal"
                        style={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#4a4a43",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          textDecoration: "underline",
                          textUnderlineOffset: "5px",
                          textDecorationThickness: "1px",
                        }}
                      >
                        Persian
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="user-menu-divider" style={{ height: "1px", background: "#e2e5dc", margin: "12px 0" }} />

              <div className="user-menu-row user-menu-row-link" style={{ marginBottom: "0" }}>
                <a
                  href={isFa ? "/fa/user-info" : "/en/user-info"}
                  className="user-menu-link user-menu-account-link"
                  role="menuitem"
                  style={{
                    textDecoration: "underline",
                    textUnderlineOffset: "5px",
                    textDecorationThickness: "1px",
                    fontSize: "12px",
                    fontWeight: 400,
                    lineHeight: 1.2,
                  }}
                >
                  {isFa ? "اطلاعات حساب کاربری" : "USER ACCOUNT INFORMATION"}
                </a>
              </div>

              <div className="user-menu-divider" style={{ height: "1px", background: "#e2e5dc", margin: "12px 0" }} />

              <div
                className="user-menu-row user-menu-row-logout"
                style={{ display: "flex", justifyContent: "center", marginBottom: "0" }}
              >
                <button
                  type="button"
                  className="user-menu-auth-button user-menu-action"
                  style={{
                    minWidth: "140px",
                    padding: "8px 14px",
                    background: "#3d3d3d",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                    textTransform: "none",
                    letterSpacing: "normal",
                  }}
                  onClick={handleLogout}
                  role="menuitem"
                >
                  {isFa ? "خروج" : "LOG OUT"}
                </button>
              </div>
            </>
          ) : (
            <div className="user-menu-auth-layout">
              <div className="user-menu-row user-menu-row-label" style={{ marginBottom: "12px" }}>
                <label className="user-menu-label" htmlFor={`user-menu-email-${locale}`}>
                  {isFa ? "ایمیل" : "Email"}
                </label>
              </div>

              <div className="user-menu-row user-menu-row-input" style={{ marginBottom: "20px" }}>
                <input
                  id={`user-menu-email-${locale}`}
                  className="user-menu-input"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder={isFa ? "example@email.com" : "example@email.com"}
                  style={{
                    width: "100%",
                    border: "1px solid #cfd3ca",
                    background: "#ffffff",
                    borderRadius: "4px",
                    padding: "9px 10px",
                    boxSizing: "border-box",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div
                className="user-menu-row user-menu-row-button"
                style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}
              >
                <button
                  type="button"
                  className="user-menu-auth-button"
                  onClick={handleSendLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "220px",
                    padding: "8px 14px",
                    fontSize: "12px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {isFa ? "ورود / ثبت‌نام" : "LOG IN / SIGN UP"}
                </button>
              </div>

              {loginMessage && (
                <div className="user-menu-row user-menu-row-message">
                  <p className={`user-menu-msg ${loginMessageType === "error" ? "error" : "success"}`}>
                    {loginMessage}
                  </p>
                </div>
              )}

              <div className="user-menu-divider" style={{ height: "1px", background: "#e2e5dc", margin: "0 0 14px" }} />

              <div className="user-menu-language-section" style={{ marginBottom: "14px" }}>
                <p className="user-menu-language-title" style={{ marginBottom: "12px" }}>
                  {isFa ? "زبان" : "Language"}
                </p>
                <div
                  className={`user-menu-language-nav ${isFa ? "fa" : "en"}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "24px",
                    direction: isFa ? "rtl" : "ltr",
                    marginBottom: "12px",
                  }}
                >
                  {isFa ? (
                    <>
                      <a
                        className="user-menu-language-item"
                        href="/en/journal"
                        style={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#4a4a43",
                          textTransform: "none",
                          letterSpacing: "0.01em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          textDecoration: "underline",
                          textUnderlineOffset: "5px",
                          textDecorationThickness: "1px",
                        }}
                      >
                        انگلیسی
                      </a>
                      <span
                        className="user-menu-language-item active"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#828b2c",
                          textTransform: "none",
                          letterSpacing: "0.01em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        فارسی
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="user-menu-language-item active"
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#828b2c",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        English
                      </span>
                      <a
                        className="user-menu-language-item"
                        href="/fa/journal"
                        style={{
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#4a4a43",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          textDecoration: "underline",
                          textUnderlineOffset: "5px",
                          textDecorationThickness: "1px",
                        }}
                      >
                        Persian
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="user-menu-divider" style={{ height: "1px", background: "#e2e5dc", margin: "0 0 14px" }} />

              <div className="user-menu-row user-menu-row-note" style={{ marginTop: "0" }}>
                <p className="user-menu-note" style={{ fontSize: "11px", lineHeight: 1.6, margin: 0 }}>
                  {isFa
                    ? "ما از روش احراز هویت بدون رمز عبور استفاده می‌کنیم. در این روش، یک لینک منحصر‌به‌فرد، با مدت اعتبار محدود و قابل استفاده تنها یک‌بار، به صندوق ایمیل شما ارسال می‌شود تا هویت شما تأیید شود. برای ثبت‌نام یا ورود، تنها به یک آدرس ایمیل معتبر نیاز دارید."
                    : "We use a passwordless authentication method that delivers a unique, time-limited, and one-time-use URL to your inbox to verify your identity. All you need to sign up or log in is a valid email address."}
                </p>
              </div>
            </div>
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
    padding: 8px 80px;
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
    padding: 7px 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    max-width: 1200px;           /* website look */
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .meq-header {
      padding: 6px 28px;
    }

    .meq-mini-nav {
      gap: 14px;
      padding: 5px 0;
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
    flex: 0 0 auto;
  }

  .user-menu-trigger {
    width: 34px !important;
    height: 34px !important;
    border-radius: 8px !important;
    border: 0.9px solid currentColor !important;
    background: #ffffff !important;
    box-sizing: border-box !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
    line-height: 1 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    font: inherit !important;
    cursor: pointer !important;
    opacity: 1 !important;
    transition: background-color 160ms ease, border-color 160ms ease;
  }

  .user-menu-trigger svg {
    width: 18px;
    height: 18px;
    display: block;
  }

  .user-menu-trigger.logged-in {
    color: #828b2c !important;
  }

  .user-menu-trigger.logged-out {
    color: #4a4a43 !important;
  }

  .user-menu-trigger:hover,
  .user-menu-trigger:focus-visible {
    background: #f7f7f4 !important;
    opacity: 1 !important;
  }

  .user-menu-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    width: 320px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    border-radius: 14px;
    padding: 12px 14px;
    z-index: 10001;
    text-transform: none;
    letter-spacing: normal;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  }

  .user-menu-dropdown.en {
    right: 6px;
    direction: ltr;
    text-align: left;
  }

  .user-menu-dropdown.fa {
    right: 6px;
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

  .user-menu-head {
    padding: 2px 2px 12px;
    margin-bottom: 6px;
    border-bottom: 1px solid #ecece6;
  }

  .user-menu-head-logged {
    padding: 2px 2px 0;
    margin-bottom: 16px;
    border-bottom: none;
  }

  .user-menu-status {
    margin-bottom: 16px;
    font-size: 11px;
    line-height: 1.55;
    color: #66685f;
    text-transform: none;
    letter-spacing: 0;
  }

  .user-menu-name {
    margin: 0;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
  }

  .user-menu-email {
    margin: 6px 0 0;
    font-size: 13px;
    color: #4a4a43;
    overflow-wrap: anywhere;
  }

  .user-menu-email-logged {
    margin-top: 40px;
    margin-bottom: 2px;
    font-size: 16px;
    font-weight: 700;
    color: #828b2c;
    line-height: 1.35;
  }

  .user-menu-language-section {
    padding: 0 2px;
  }

  .user-menu-language-title {
    margin: 0 0 8px;
    font-size: 11px;
    color: #66685f;
    text-transform: none;
    letter-spacing: 0;
  }

  .user-menu-language-nav {
    display: flex;
    align-items: center;
    column-gap: 30px;
    row-gap: 8px;
  }

  .user-menu-language-nav.fa {
    direction: rtl;
  }

  .user-menu-language-nav.en {
    direction: ltr;
  }

  .user-menu-language-item {
    color: inherit;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding-bottom: 15px;
    line-height: 1.2;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .user-menu-language-item + .user-menu-language-item {
    margin-inline-start: 24px;
  }

  .user-menu-language-item:not(.active) {
    text-decoration: underline;
    text-underline-offset: 5px;
    text-decoration-thickness: 1px;
  }

  .user-menu-language-item::after {
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

  a.user-menu-language-item:hover::after,
  a.user-menu-language-item:focus-visible::after {
    opacity: 1;
  }

  .user-menu-language-item.active {
    cursor: default;
    font-weight: 800;
    color: #828b2c;
  }

  .user-menu-language-item.active::after {
    opacity: 1;
  }

  .user-menu-account-link {
    text-decoration: underline !important;
    text-underline-offset: 5px;
    text-decoration-thickness: 1px;
  }

  .user-menu-link {
    all: unset;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    align-items: center;
    min-height: 44px;
    padding: 0 2px;
    margin: 0;
    text-decoration: none;
    color: #4a4a43;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    font-size: 12px;
    line-height: 1.4;
  }

  .user-menu-link:hover,
  .user-menu-link:focus-visible {
    background: #f7f7f4;
  }

  .user-menu-action {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  .user-menu-input {
    width: 100%;
    border: 1px solid #d8dbd2;
    padding: 9px 10px;
    margin: 0;
    font-family: inherit;
    background: #ffffff;
    box-sizing: border-box;
    border-radius: 4px;
  }

  .user-menu-auth-layout {
    padding: 12px 6px 10px;
  }

  .user-menu-row {
    width: 100%;
  }

  .user-menu-row-label {
    margin-bottom: 10px;
  }

  .user-menu-row-input {
    margin-bottom: 18px;
  }

  .user-menu-row-button {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .user-menu-row-message {
    margin-top: -4px;
    margin-bottom: 8px;
  }

  .user-menu-row-note {
    margin-top: 14px;
  }

  .user-menu-row-link {
    margin-bottom: 10px;
  }

  .user-menu-row-logout {
    margin-top: 10px;
  }

  .user-menu-label {
    display: block;
    margin: 0;
    font-size: 12px;
    color: #66685f;
    text-transform: none;
    letter-spacing: 0;
  }

  .user-menu-auth-button {
    display: block;
    width: auto;
    min-width: 190px;
    border: none;
    background: #3d3d3d;
    color: #ffffff;
    padding: 8px 14px;
    margin: 0;
    font-family: inherit;
    font-size: 11px;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .user-menu-msg {
    margin: 6px 0 0;
    font-size: 10px;
    text-align: center;
  }

  .user-menu-msg.success {
    color: #828b2c;
  }

  .user-menu-msg.error {
    color: #d14343;
  }

  .user-menu-divider {
    height: 1px;
    background: #ecece6;
    margin: 0 0 2px;
  }

  .user-menu-divider-logged {
    margin: 6px 0;
  }

  .user-menu-note {
    margin: 0;
    font-size: 11px;
    line-height: 1.55;
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
      padding: 5px 20px;
    }

    .meq-mini-nav {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      padding: 4px 0;
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
      width: 280px;
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
          {!isFa && userMenu}
        </div>
      </nav>
    </header>
  );
}
