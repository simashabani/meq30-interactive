type Props = {
  locale: "en" | "fa";
};

export default function SiteFooter({ locale }: Props) {
  const isFa = locale === "fa";

  return (
    <footer className="site-footer">
      <div className="site-footer-inner site-footer-grid">
        <div style={{ maxWidth: 700 }}>
          <p className="site-footer-title">
            {isFa
              ? "ارزیابی و دفترچه تجربه MEQ-30"
              : "MEQ-30 Assessment and Experience Journal"}
          </p>

          <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
            {isFa
              ? "ایجاد شده توسط س. شعبانی، دانشجوی دکتری، دانشگاه اتاوا، کانادا."
              : "Created by S. Shabani, Doctoral Student, University of Ottawa, Canada."}
          </p>

          <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
            {isFa
              ? "ارزیابی و دفترچه تجربه MEQ-30 یک ابزار پژوهشی برای مطالعات دانشگاهی است و توصیهٔ پزشکی یا بالینی محسوب نمی‌شود."
              : "MEQ-30 Assessment and Experience Journal is a research instrument used in academic studies and does not constitute clinical or medical advice."}
          </p>

          <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
            {isFa
              ? "تمام ورودی‌های کاربران خصوصی بوده و به‌صورت امن نگهداری می‌شود."
              : "All user entries are private and securely stored."}
          </p>
        </div>

        <div className="site-footer-right" style={{ alignSelf: "center" }}>
          <p className="site-footer-text" style={{ margin: 0 }}>
            {isFa ? "وب‌سایت و اپلیکیشن توسط" : "Website and application developed by"}
          </p>
          <p className="site-footer-text" style={{ marginTop: "2px", marginBottom: 0 }}>
            Maud Consulting LLC
          </p>

          <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
            {isFa ? "پرسش‌های فنی:" : "Technical inquiries:"}{" "}
            <a href="mailto:info@maudconsulting.com" className="site-footer-link">
              info@maudconsulting.com
            </a>
          </p>

          <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
            © 2026 Maud Consulting LLC. All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  );
}