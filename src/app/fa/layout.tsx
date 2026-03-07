import type { Metadata } from "next";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import TabCloseHandler from "@/components/TabCloseHandler";

export const metadata: Metadata = {
  title: "پرسشنامه تجربه عرفانی MEQ-30 | دفتر ثبت تجربه روان‌نما (سایکدلیک)",
  description:
    "ارزیابی و ثبت تجربه‌های عرفانی با استفاده از پرسشنامه MEQ-30. یک دفترچه خصوصی برای بررسی و تأمل در تجربه‌های روان‌نما (سایکدلیک) برای افراد و پژوهشگران حوزه سایکدلیک.",
  alternates: {
    canonical: "/fa/journal",
    languages: {
      en: "/en/journal",
      fa: "/fa/journal",
    },
  },
  openGraph: {
    title: "پرسشنامه تجربه عرفانی MEQ-30 | دفتر ثبت تجربه روان‌نما (سایکدلیک)",
    description:
      "ارزیابی و ثبت تجربه‌های عرفانی با استفاده از پرسشنامه MEQ-30. یک دفترچه خصوصی برای بررسی و تأمل در تجربه‌های روان‌نما (سایکدلیک) برای افراد و پژوهشگران حوزه سایکدلیک.",
    url: "https://app.meq-30.com/fa/journal",
    locale: "fa_IR",
  },
  twitter: {
    title: "پرسشنامه تجربه عرفانی MEQ-30 | دفتر ثبت تجربه روان‌نما (سایکدلیک)",
    description:
      "ارزیابی و ثبت تجربه‌های عرفانی با استفاده از پرسشنامه MEQ-30. یک دفترچه خصوصی برای بررسی و تأمل در تجربه‌های روان‌نما (سایکدلیک) برای افراد و پژوهشگران حوزه سایکدلیک.",
  },
};

export default function FaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="locale-fa" dir="rtl" lang="fa" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TabCloseHandler />
      <Header locale="fa" />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px clamp(16px, 4vw, 80px)", flex: 1, width: "100%" }}>
        {children}
      </main>
      <SiteFooter locale="fa" />
    </div>
  );
}

