import Link from "next/link";

export default function HomeEn() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Home</h1>
      <p className="mb-6">[Placeholder] You can keep a journal of your mystical experiences here.</p>
      <Link
        href="/en/journal"
        className="inline-block px-6 py-3 rounded bg-black text-white text-lg"
      >
        Go to My Journal
      </Link>
    </div>
  );
}
