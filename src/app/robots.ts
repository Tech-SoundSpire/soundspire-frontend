import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://app.soundspire.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth-gated / non-content surfaces — no value to crawlers, keep them out.
      disallow: [
        "/api/",
        "/explore",
        "/feed",
        "/settings",
        "/notifications",
        "/my-music",
        "/complete-profile",
        "/PreferenceSelectionPage",
        "/reset-password",
        "/forgot-password",
        "/verifyemail",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
