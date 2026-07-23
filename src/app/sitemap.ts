import type { MetadataRoute } from "next";
import { Op } from "sequelize";
import Artist from "@/models/Artist";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import "@/models/index";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://app.soundspire.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/signup`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/artist-onboarding`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Onboarded artists (user_id set) → public community pages.
  let artistRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectionTestingAndHelper();
    const artists = await Artist.findAll({
      where: { user_id: { [Op.ne]: null } },
      attributes: ["slug", "updated_at"],
    });
    artistRoutes = artists
      .map((a) => a.get({ plain: true }) as { slug: string; updated_at?: Date })
      .filter((row) => row.slug)
      .map((row) => ({
        url: `${BASE}/community/${row.slug}`,
        lastModified: row.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (err) {
    // DB unreachable at build/request time → still emit the static routes.
    console.error("sitemap: failed to load artists", err);
  }

  return [...staticRoutes, ...artistRoutes];
}
