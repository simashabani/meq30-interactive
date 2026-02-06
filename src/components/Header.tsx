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
        <Link href={isFa ? "/fa" : "/en"} style={{ fontWeight: 700 }}>
          {isFa ? "MEQ-30 تعاملی" : "MEQ-30 Interactive"}
        </Link>

        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Link href={isFa ? "/fa/about" : "/en/about"}>
            {isFa ? "درباره" : "About"}
          </Link>
          <Link href={isFa ? "/fa/privacy" : "/en/privacy"}>
            {isFa ? "حریم خصوصی" : "Privacy"}
          </Link>

          {/* Language toggle */}
          <Link
            href={isFa ? "/en" : "/fa"}
            style={{
              border: "1px solid #e5e7eb",
              padding: "6px 10px",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {isFa ? "English" : "فارسی"}
          </Link>
<Link href={isFa ? "/fa/login" : "/en/login"}>
  {isFa ? "ورود" : "Login"}
</Link>

        </nav>
      </div>
    </header>
  );
}
