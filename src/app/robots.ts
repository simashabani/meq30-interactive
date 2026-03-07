import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en", "/fa", "/en/privacy", "/fa/privacy"],
        disallow: [
          "/api/",
          "/auth/",
          "/en/auth/",
          "/fa/auth/",
          "/en/journal/new",
          "/fa/journal/new",
          "/en/journal/review",
          "/fa/journal/review",
          "/en/user-info",
          "/fa/user-info",
        ],
      },
    ],
    sitemap: "https://app.meq-30.com/sitemap.xml",
    host: "https://app.meq-30.com",
  };
}
