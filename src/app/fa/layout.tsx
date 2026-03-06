import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import TabCloseHandler from "@/components/TabCloseHandler";

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

