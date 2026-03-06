import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import TabCloseHandler from "@/components/TabCloseHandler";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="locale-en" lang="en" dir="ltr">
      <TabCloseHandler />
      <Header locale="en" />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px clamp(16px, 4vw, 80px)", minHeight: "calc(100vh - 200px)" }}>
        {children}
      </main>
      <SiteFooter locale="en" />
    </div>
  );
}

