import type { Metadata } from "next";
import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import BlogShell from "./BlogShell";
import EditorLink from "./EditorLink";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Blog",
    description: "News, stories and updates from SoundSpire, the music community for superfans and the artists they love.",
    alternates: { canonical: "/blog" },
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogIndexPage() {
    const posts = await listBlogPosts();
    return (
        <BlogShell actions={<EditorLink href="/blog/new" label="New post" />}>
            <h1 className="text-3xl md:text-4xl font-black mb-2">Blog</h1>
            <p className="text-white/50 mb-10">News, stories and updates from SoundSpire.</p>

            {posts.length === 0 ? (
                <p className="text-white/50">No posts yet.</p>
            ) : (
                <div className="space-y-6">
                    {posts.map((p) => (
                        <Link key={p.slug} href={`/blog/${p.slug}`}
                            className="block rounded-2xl overflow-hidden bg-[#221c2f] border border-gray-800 hover:border-[#FF4E27]/50 transition">
                            {p.cover_image_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={getImageUrl(p.cover_image_url)} alt="" className="w-full aspect-[2/1] object-cover" />
                            )}
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-2">{p.title}</h2>
                                {p.excerpt && <p className="text-white/70 text-sm mb-3">{p.excerpt}</p>}
                                <p className="text-white/40 text-xs">{p.author_name} · {fmt(p.created_at)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </BlogShell>
    );
}
