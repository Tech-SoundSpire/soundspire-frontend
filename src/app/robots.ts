import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://app.soundspire.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // /api/images/ serves artist photos and the logo used in share cards and structured
      // data, so crawlers must be able to fetch it. The rest of /api/ stays blocked.
      allow: ["/", "/api/images/"],
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
        "/under-review",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
