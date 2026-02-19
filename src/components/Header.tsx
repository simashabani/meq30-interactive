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
        padding: "14px 18px",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Left navigation */}
        <nav style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <a
            href={isFa ? "https://meq-30.com/homepersian" : "https://meq-30.com/"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {isFa ? "خانه" : "MEQ-30 Home"}
          </a>
          <Link href={isFa ? "/fa/journal" : "/en/journal"} style={{ fontWeight: 700 }}>
            {isFa ? "دفتر تجربه‌های من" : "My Experience Journal"}
          </Link>
        </nav>

        {/* Right navigation */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {/* Language toggle */}
          <button
            onClick={() => window.location.href = isFa ? "/en/journal" : "/fa/journal"}
            style={{
              border: "1px solid #e5e7eb",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 14,
              background: "white",
              cursor: "pointer",
            }}
          >
            {isFa ? "English" : "فارسی"}
          </button>
        </div>
      </div>
    </header>
  );
}
