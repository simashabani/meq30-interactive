import Header from "@/components/Header";

export default function FaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl">
      <Header locale="fa" />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        {children}
      </main>
    </div>
  );
}

