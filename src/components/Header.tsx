"use client";

import Link from "next/link";

type Props = {
  locale: "en" | "fa";
};

export default function Header({ locale }: Props) {
  const isFa = locale === "fa";

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 32px",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Left side - Site title and navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link 
            href={isFa ? "/fa/journal" : "/en/journal"}
            style={{ 
              fontSize: "0.95rem",
              fontFamily: "'Lora', Georgia, serif",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: "#1a1a1a",
            }}
          >
            MEQ-30 Assessment and Experience Journal
          </Link>
          
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a
              href={isFa ? "https://meq-30.com/homepersian" : "https://meq-30.com/"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              {isFa ? "خانه" : "Home"}
            </a>
            <Link 
              href={isFa ? "/fa/journal" : "/en/journal"} 
              style={{ 
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {isFa ? "دفتر تجربه‌های من" : "My Journal"}
            </Link>
          </nav>
        </div>

        {/* Right side - Language toggle */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.9rem" }}>
          <Link
            href="/en/journal"
            style={{
              fontWeight: isFa ? 400 : 600,
              textDecoration: isFa ? "none" : "underline",
            }}
          >
            English
          </Link>
          <span style={{ color: "#999" }}>|</span>
          <Link
            href="/fa/journal"
            style={{
              fontWeight: isFa ? 600 : 400,
              textDecoration: isFa ? "underline" : "none",
            }}
          >
            Persian
          </Link>
        </div>
      </div>
    </header>
  );
}
