import type { MetadataRoute } from "next";
import { Op } from "sequelize";
import Artist from "@/models/Artist";
import BlogPost from "@/models/BlogPost";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import "@/models/index";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://app.soundspire.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/artist-onboarding`, changeFrequency: "monthly", priority: 0.5 },
    // Login/signup omitted: no search value. Legal pages are public, indexable content.
    ...["privacy", "terms", "artist-terms", "community-guidelines", "child-safety", "delete-account"].map(
      (p) => ({ url: `${BASE}/${p}`, changeFrequency: "yearly" as const, priority: 0.2 })
    ),
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

  // Blog posts (+ the blog index and press kit).
  let blogRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/press`, changeFrequency: "monthly", priority: 0.5 },
  ];
  try {
    const posts = await BlogPost.findAll({ attributes: ["slug", "updated_at"] });
    blogRoutes = blogRoutes.concat(posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`, lastModified: p.updated_at, changeFrequency: "monthly" as const, priority: 0.6,
    })));
  } catch (err) {
    console.error("sitemap: failed to load blog posts", err);
  }

  return [...staticRoutes, ...artistRoutes, ...blogRoutes];
}
