import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import TabCloseHandler from "@/components/TabCloseHandler";

export default function FaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="locale-fa" dir="rtl" lang="fa">
      <TabCloseHandler />
      <Header locale="fa" />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "48px 80px", minHeight: "calc(100vh - 200px)" }}>
        {children}
      </main>
      <SiteFooter locale="fa" />
    </div>
  );
}

