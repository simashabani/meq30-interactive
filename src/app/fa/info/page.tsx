export default function InfoPageFa() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">اطلاعات</h1>
      <ul className="mb-6">
        <li><a href="#section1">بخش ۱</a></li>
        <li><a href="#section2">بخش ۲</a></li>
        <li><a href="#section3">بخش ۳</a></li>
      </ul>
      <div id="section1" className="mb-8">
        <h2 className="text-lg font-bold">بخش ۱</h2>
        <p>محتوای بخش ۱ (نمونه).</p>
      </div>
      <div id="section2" className="mb-8">
        <h2 className="text-lg font-bold">بخش ۲</h2>
        <p>محتوای بخش ۲ (نمونه).</p>
      </div>
      <div id="section3" className="mb-8">
        <h2 className="text-lg font-bold">بخش ۳</h2>
        <p>محتوای بخش ۳ (نمونه).</p>
      </div>
    </div>
  );
}
