export default function InfoPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Info</h1>
      <ul className="mb-6">
        <li><a href="#section1">Section 1</a></li>
        <li><a href="#section2">Section 2</a></li>
        <li><a href="#section3">Section 3</a></li>
      </ul>
      <div id="section1" className="mb-8">
        <h2 className="text-lg font-bold">Section 1</h2>
        <p>Content for section 1 (placeholder).</p>
      </div>
      <div id="section2" className="mb-8">
        <h2 className="text-lg font-bold">Section 2</h2>
        <p>Content for section 2 (placeholder).</p>
      </div>
      <div id="section3" className="mb-8">
        <h2 className="text-lg font-bold">Section 3</h2>
        <p>Content for section 3 (placeholder).</p>
      </div>
    </div>
  );
}
