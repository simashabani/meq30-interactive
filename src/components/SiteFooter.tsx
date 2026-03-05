type Props = {
  locale: "en" | "fa";
};

export default function SiteFooter({ locale }: Props) {
  const isFa = locale === "fa";

  if (isFa) {
    return (
      <footer className="site-footer site-footer-fa">
        <div className="site-footer-inner site-footer-grid site-footer-fa-grid">
          <div className="site-footer-fa-left" style={{ alignSelf: "center" }}>
            <p className="site-footer-text" style={{ margin: 0 }}>
              وب‌سایت و اپلیکیشن توسط : Maud Consulting LLC
            </p>

            <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
              پرسش‌های فنی :{" "}
              <a href="mailto:info@maudconsulting.com" className="site-footer-link">
                info@maudconsulting.com
              </a>
            </p>

            <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
              © 2026 Maud Consulting LLC. کلیه حقوق محفوظ می‌باشد.
            </p>
          </div>

          <div className="site-footer-fa-right">
            <p className="site-footer-title">
              ارزیابی تجربه‌های عرفانی با پرسشنامه MEQ-30 و دفترچه ثبت تجربه‌ها
            </p>

            <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
              تهیه‌شده توسط س. شعبانی، دانشجوی دکتری، دانشگاه اتاوا، کانادا
            </p>

            <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
              ابزار ارزیابی MEQ-30 و دفترچه ثبت تجربه‌ها یک ابزار پژوهشی است که در مطالعات دانشگاهی به کار می‌رود و به معنای ارائه توصیه پزشکی یا مشاوره درمانی نمی‌باشد.
            </p>

            <p className="site-footer-text" style={{ marginTop: "18px", marginBottom: 0 }}>
              تمام اطلاعاتی که کاربران ثبت می‌کنند خصوصی است و به‌صورت امن نگهداری می‌شود.
            </p>
          </div>
        </div>
      </footer>
    );
  }

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