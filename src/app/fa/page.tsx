import Link from "next/link";

export default function HomeFa() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">خانه</h1>
      <p className="mb-6">[نمونه] شما می‌توانید دفتر خاطرات تجربه‌های عرفانی خود را اینجا نگهداری کنید.</p>
      <Link
        href="/fa/journal"
        className="inline-block px-6 py-3 rounded bg-black text-white text-lg"
      >
        رفتن به دفتر تجربه‌ها
      </Link>
    </div>
  );
}
