"use client";

type Props = {
  locale: "en" | "fa";
};

export default function Header({ locale }: Props) {
  const isFa = locale === "fa";

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 80px",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 9999,
      }}
    >
      <style jsx>{`
  .meq-mini-nav {
    font-family: ${
      isFa
        ? "'IranSans', Tahoma, Arial, sans-serif"
        : "'Nunito', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    };
    direction: ${isFa ? "rtl" : "ltr"};
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 18px 0;             /* closer to your website */
    text-transform: uppercase;
    letter-spacing: 0.04em;
    max-width: 1200px;           /* website look */
    margin: 0 auto;
  }

  .meq-mini-nav .left,
  .meq-mini-nav .right {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }

  .meq-item {
    color: inherit;
    text-decoration: none;
    position: relative;
    display: inline-block;
    padding-bottom: 6px;
    line-height: 1.2;
    white-space: nowrap;
  }

  .left .meq-item {
    font-size: 16px;
    font-weight: 400;
  }

  /* Languages: same size, active just bolder + underline */
  .right .meq-item {
    font-size: 12px;
    font-weight: 400;
  }

  a.meq-item {
    cursor: pointer;
  }

  .meq-item::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    bottom: 0;
    transform: translateY(1px);
    opacity: 0;
    transition: opacity 180ms ease;
    background: currentColor;
  }

  a.meq-item:hover::after,
  a.meq-item:focus-visible::after {
    opacity: 1;
  }

  .meq-item.active {
    cursor: default;
    font-weight: 600;
  }

  .meq-item.active::after {
    opacity: 1;
  }

  @media (max-width: 520px) {
    .meq-mini-nav {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 0;
    }

    .meq-mini-nav .left {
      flex: 1;
      justify-content: flex-start;
      gap: 12px;
      flex-wrap: nowrap;
    }

    .left .meq-item {
      font-size: 12px;
    }

    .meq-mini-nav .right {
      flex: 0 0 auto;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-start;
      gap: 6px;
      flex-wrap: nowrap;
    }

    .right .meq-item {
      font-size: 10px;
    }

    .meq-item::after {
      transform: translateY(0px);
    }
  }
`}</style>

      <nav className="meq-mini-nav" aria-label="MEQ-30 Navigation">
        <div className="left">
          <a
            className="meq-item"
            href={isFa ? "https://meq-30.com/homepersian" : "https://meq-30.com"}
            target="_top"
            rel="noopener"
          >
            {isFa ? "خانه" : "Home"}
          </a>

          <span className="meq-item active">
            {isFa ? "دفترچه تجربه‌های من" : "My Experience Journal"}
          </span>
        </div>

        <div className="right">
          {isFa ? (
            <>
              <a
                className="meq-item"
                href="/en/journal"
              >
                انگلیسی
              </a>
              <span className="meq-item active">فارسی</span>
            </>
          ) : (
            <>
              <span className="meq-item active">English</span>
              <a
                className="meq-item"
                href="/fa/journal"
              >
                Persian
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
