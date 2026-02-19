import Header from "@/components/Header";
import TabCloseHandler from "@/components/TabCloseHandler";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TabCloseHandler />
      <Header locale="en" />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px", minHeight: "calc(100vh - 200px)" }}>
        {children}
      </main>
    </>
  );
}

