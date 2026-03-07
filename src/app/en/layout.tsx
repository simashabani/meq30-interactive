import type { Metadata } from "next";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import TabCloseHandler from "@/components/TabCloseHandler";

export const metadata: Metadata = {
  title: "MEQ-30 Assessment & Psychedelic Mystical Experience Journal",
  description:
    "Explore and assess mystical experiences using the MEQ-30 (Mystical Experience Questionnaire). A research-based private journal for psychedelic researchers and individuals.",
  alternates: {
    canonical: "/en/journal",
    languages: {
      en: "/en/journal",
      fa: "/fa/journal",
    },
  },
  openGraph: {
    title: "MEQ-30 Assessment & Psychedelic Mystical Experience Journal",
    description:
      "Explore and assess mystical experiences using the MEQ-30 (Mystical Experience Questionnaire). A research-based private journal for psychedelic researchers and individuals.",
    url: "https://app.meq-30.com/en/journal",
    locale: "en_US",
  },
  twitter: {
    title: "MEQ-30 Assessment & Psychedelic Mystical Experience Journal",
    description:
      "Explore and assess mystical experiences using the MEQ-30 (Mystical Experience Questionnaire). A research-based private journal for psychedelic researchers and individuals.",
  },
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="locale-en" lang="en" dir="ltr" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TabCloseHandler />
      <Header locale="en" />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px clamp(16px, 4vw, 80px)", flex: 1, width: "100%" }}>
        {children}
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}

