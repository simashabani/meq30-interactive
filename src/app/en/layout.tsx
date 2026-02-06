import Header from "@/components/Header";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="en" />
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
        {children}
      </main>
    </>
  );
}

