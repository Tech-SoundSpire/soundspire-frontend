import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getBlogPost, postDescription } from "@/lib/blog";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import BlogShell from "../BlogShell";
import EditorLink from "../EditorLink";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.soundspire.online";
const loadPost = cache((slug: string) => getBlogPost(slug));
type Props = { params: Promise<{ slug: string }> };

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await loadPost((await params).slug);
    if (!post) return { title: "Post not found", robots: { index: false } };
    const description = postDescription(post);
    const firstImage = post.content.find((b) => b.type === "image");
    const image = post.cover_image_url || (firstImage?.type === "image" ? firstImage.url : null);
    const images = image ? [getImageUrl(image)] : undefined;
    const path = `/blog/${post.slug}`;
    return {
        title: post.title,
        description,
        alternates: { canonical: path },
        openGraph: { type: "article", title: post.title, description, url: path, publishedTime: post.created_at, modifiedTime: post.updated_at, ...(images ? { images } : {}) },
        twitter: { card: images ? "summary_large_image" : "summary", title: post.title, description, ...(images ? { images } : {}) },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const post = await loadPost((await params).slug);
    if (!post) notFound();

    // Article structured data (JSON, not HTML): built from server data, with "<" escaped so
    // no text can close the script tag. Same pattern as the homepage JSON-LD.
    const jsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: postDescription(post),
        datePublished: post.created_at,
        dateModified: post.updated_at,
        author: { "@type": "Person", name: post.author_name },
        publisher: { "@type": "Organization", name: "SoundSpire", logo: { "@type": "ImageObject", url: `${BASE_URL}/api/images/assets/ss_logo.png` } },
        mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
        ...(post.cover_image_url ? { image: `${BASE_URL}${getImageUrl(post.cover_image_url)}` } : {}),
    }).replace(/</g, "\\u003c");

    return (
        <BlogShell actions={<EditorLink href={`/blog/${post.slug}/edit`} label="Edit" />}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
            <article>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">{post.title}</h1>
                <p className="text-white/40 text-sm mb-8">
                    {post.author_name} · {fmt(post.created_at)}
                    {post.updated_at.slice(0, 10) !== post.created_at.slice(0, 10) && <> · Updated {fmt(post.updated_at)}</>}
                </p>
                {post.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getImageUrl(post.cover_image_url)} alt="" className="w-full rounded-2xl mb-8" />
                )}
                <div className="space-y-5 text-white/85 leading-relaxed">
                    {post.content.map((b, i) => {
                        if (b.type === "heading") return <h2 key={i} className="text-2xl font-bold text-white pt-4">{b.text}</h2>;
                        if (b.type === "image") return (
                            <figure key={i}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getImageUrl(b.url)} alt={b.caption || ""} className="w-full rounded-xl" />
                                {b.caption && <figcaption className="text-white/50 text-sm mt-2 text-center">{b.caption}</figcaption>}
                            </figure>
                        );
                        // Text: blank lines split paragraphs; single line breaks are kept.
                        return b.text.split(/\n\s*\n/).map((para, j) => (
                            <p key={`${i}-${j}`} className="whitespace-pre-line">{para}</p>
                        ));
                    })}
                </div>
            </article>
        </BlogShell>
    );
}
