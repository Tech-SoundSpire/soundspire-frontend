import { NextRequest } from "next/server";
import { Op } from "sequelize";
import BlogPost, { BlogBlock } from "@/models/BlogPost";
import { User } from "@/models/User";
import { connectionTestingAndHelper } from "@/utils/dbConnection";
import { getDataFromToken } from "@/utils/getDataFromToken";

import { BLOG_EDITOR_DOMAIN, isBlogEditorEmail } from "@/utils/blogEditor";

// Resolves the caller and checks they may edit the blog. Returns the user or an HTTP error.
export async function requireBlogEditor(request: NextRequest) {
    let userId: string | undefined;
    try { userId = getDataFromToken(request); } catch { userId = undefined; }
    if (!userId) return { error: "Unauthorized", status: 401 } as const;
    const user = await User.findOne({ where: { user_id: userId }, attributes: ["user_id", "email", "is_banned"] });
    if (!user || user.is_banned) return { error: "Unauthorized", status: 401 } as const;
    if (!isBlogEditorEmail(user.email)) {
        return { error: `Only ${BLOG_EDITOR_DOMAIN} accounts can write blog posts`, status: 403 } as const;
    }
    return { userId: user.user_id } as const;
}

const MAX_BLOCKS = 200;
const MAX_TEXT = 20000;
// Images must be our own S3 uploads (or an https URL); anything else is dropped.
const okImage = (u: unknown): u is string =>
    typeof u === "string" && (u.startsWith("s3://soundspirewebsiteassets/") || u.startsWith("https://"));

// Normalizes untrusted editor input into the stored shape; returns an error string if invalid.
export function sanitizePostInput(body: any): { error: string } | {
    title: string; excerpt: string | null; cover_image_url: string | null; content: BlogBlock[];
} {
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 200) : "";
    if (!title) return { error: "Title is required" };
    const excerpt = typeof body?.excerpt === "string" && body.excerpt.trim() ? body.excerpt.trim().slice(0, 300) : null;
    const cover_image_url = okImage(body?.cover_image_url) ? body.cover_image_url : null;
    const content: BlogBlock[] = [];
    for (const b of Array.isArray(body?.content) ? body.content.slice(0, MAX_BLOCKS) : []) {
        if ((b?.type === "text" || b?.type === "heading") && typeof b.text === "string" && b.text.trim()) {
            content.push({ type: b.type, text: b.text.slice(0, b.type === "heading" ? 200 : MAX_TEXT) });
        } else if (b?.type === "image" && okImage(b.url)) {
            const caption = typeof b.caption === "string" && b.caption.trim() ? b.caption.trim().slice(0, 300) : undefined;
            content.push({ type: "image", url: b.url, ...(caption ? { caption } : {}) });
        }
    }
    if (content.length === 0) return { error: "Add at least one text or image block" };
    return { title, excerpt, cover_image_url, content };
}

// URL slug from the title; adds -2, -3, ... if taken. Set once at creation so links never break.
export async function uniqueSlug(title: string): Promise<string> {
    const base = title.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "post";
    if (base === "new") return uniqueSlug("new post"); // /blog/new is the editor route
    const taken = new Set(
        (await BlogPost.findAll({ where: { slug: { [Op.like]: `${base}%` } }, attributes: ["slug"] })).map((p) => p.slug)
    );
    if (!taken.has(base)) return base;
    for (let i = 2; ; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
}

// Plain-object shapes passed to pages (serializable for client components).
export type BlogPostSummary = {
    slug: string; title: string; excerpt: string | null; cover_image_url: string | null;
    author_name: string; created_at: string; updated_at: string;
};
export type BlogPostFull = BlogPostSummary & { content: BlogBlock[] };

async function authorNames(ids: string[]) {
    const users = ids.length
        ? await User.findAll({ where: { user_id: [...new Set(ids)] }, attributes: ["user_id", "full_name", "username"] })
        : [];
    return new Map(users.map((u) => [u.user_id, u.full_name || u.username || "SoundSpire"]));
}

const toSummary = (p: BlogPost, names: Map<string, string>): BlogPostSummary => ({
    slug: p.slug, title: p.title, excerpt: p.excerpt, cover_image_url: p.cover_image_url,
    author_name: names.get(p.author_user_id) || "SoundSpire",
    created_at: new Date(p.created_at).toISOString(), updated_at: new Date(p.updated_at).toISOString(),
});

export async function listBlogPosts(): Promise<BlogPostSummary[]> {
    await connectionTestingAndHelper();
    const posts = await BlogPost.findAll({
        attributes: ["slug", "title", "excerpt", "cover_image_url", "author_user_id", "created_at", "updated_at"],
        order: [["created_at", "DESC"]],
    });
    const names = await authorNames(posts.map((p) => p.author_user_id));
    return posts.map((p) => toSummary(p, names));
}

export async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
    await connectionTestingAndHelper();
    const p = await BlogPost.findOne({ where: { slug } });
    if (!p) return null;
    const names = await authorNames([p.author_user_id]);
    return { ...toSummary(p, names), content: p.content || [] };
}

// First text block, trimmed, for descriptions when no excerpt was written.
export function postDescription(p: { excerpt: string | null; content?: BlogBlock[] }) {
    const raw = p.excerpt || p.content?.find((b) => b.type === "text")?.text || "";
    const s = raw.replace(/\s+/g, " ").trim();
    return s.length > 155 ? `${s.slice(0, 152).trimEnd()}...` : s;
}
