"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { isBlogEditorEmail, BLOG_EDITOR_DOMAIN } from "@/utils/blogEditor";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import type { BlogBlock } from "@/models/BlogPost";
import BlogShell from "./BlogShell";

// Uploads an image through the existing presigned-URL route; returns its s3:// path.
async function uploadImage(file: File): Promise<string | null> {
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB per image"); return null; }
    try {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const fileName = `images/blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName, fileType: file.type }),
        });
        if (!res.ok) throw new Error();
        const { uploadUrl } = await res.json();
        const up = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
        if (!up.ok) throw new Error();
        return `s3://soundspirewebsiteassets/${fileName}`;
    } catch {
        toast.error("Image upload failed");
        return null;
    }
}

const inputCls = "w-full bg-[#2d2838] rounded-lg p-3 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-[#FF4E27]";

// Create (no slug) or edit (slug) a blog post. Only @soundspire.online accounts can use it;
// the API enforces the same rule.
export default function BlogEditor({ slug }: { slug?: string }) {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [cover, setCover] = useState<string | null>(null);
    const [blocks, setBlocks] = useState<BlogBlock[]>([{ type: "text", text: "" }]);
    const [loading, setLoading] = useState(!!slug);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                const res = await fetch(`/api/blog/${slug}`);
                if (!res.ok) throw new Error();
                const { post } = await res.json();
                setTitle(post.title); setExcerpt(post.excerpt || ""); setCover(post.cover_image_url);
                setBlocks(post.content?.length ? post.content : [{ type: "text", text: "" }]);
            } catch { toast.error("Could not load the post"); }
            finally { setLoading(false); }
        })();
    }, [slug]);

    if (isLoading || loading) return <BlogShell><p className="text-white/50">Loading…</p></BlogShell>;
    if (!isBlogEditorEmail(user?.email)) {
        return <BlogShell><p className="text-white/70">Only {BLOG_EDITOR_DOMAIN} accounts can write blog posts.</p></BlogShell>;
    }

    const update = (i: number, b: BlogBlock) => setBlocks((prev) => prev.map((x, j) => (j === i ? b : x)));
    const remove = (i: number) => setBlocks((prev) => prev.filter((_, j) => j !== i));
    const move = (i: number, d: -1 | 1) => setBlocks((prev) => {
        const j = i + d; if (j < 0 || j >= prev.length) return prev;
        const next = [...prev]; [next[i], next[j]] = [next[j], next[i]]; return next;
    });
    const addImage = async (file?: File) => {
        if (!file) return;
        setUploading(true);
        const url = await uploadImage(file);
        setUploading(false);
        if (url) setBlocks((prev) => [...prev, { type: "image", url }]);
    };
    const setCoverFile = async (file?: File) => {
        if (!file) return;
        setUploading(true);
        const url = await uploadImage(file);
        setUploading(false);
        if (url) setCover(url);
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch(slug ? `/api/blog/${slug}` : "/api/blog", {
                method: slug ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title, excerpt, cover_image_url: cover, content: blocks }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Save failed");
            toast.success(slug ? "Post updated" : "Post published");
            router.push(`/blog/${data.slug}`);
            router.refresh();
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <BlogShell>
            <h1 className="text-2xl font-black mb-6">{slug ? "Edit post" : "New post"}</h1>
            <div className="space-y-4">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" maxLength={200} className={`${inputCls} text-xl font-bold`} />
                <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short summary (optional, shown on the blog list and in search results)" maxLength={300} rows={2} className={inputCls} />

                <div className="rounded-xl border border-white/10 p-4">
                    <p className="text-sm text-white/60 mb-2">Cover image (optional)</p>
                    {cover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={getImageUrl(cover)} alt="" className="w-full max-h-64 object-cover rounded-lg mb-2" />
                    )}
                    <div className="flex gap-3 text-sm">
                        <label className="text-[#FF4E27] cursor-pointer hover:underline">
                            {cover ? "Change" : "Upload"}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { setCoverFile(e.target.files?.[0]); e.target.value = ""; }} />
                        </label>
                        {cover && <button type="button" onClick={() => setCover(null)} className="text-white/50 hover:text-white">Remove</button>}
                    </div>
                </div>

                {blocks.map((b, i) => (
                    <div key={i} className="rounded-xl border border-white/10 p-3">
                        <div className="flex justify-between items-center mb-2 text-xs text-white/40">
                            <span className="uppercase tracking-wider">{b.type}</span>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="hover:text-white disabled:opacity-30">↑</button>
                                <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="hover:text-white disabled:opacity-30">↓</button>
                                <button type="button" onClick={() => remove(i)} className="hover:text-red-400">Remove</button>
                            </div>
                        </div>
                        {b.type === "image" ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getImageUrl(b.url)} alt="" className="w-full rounded-lg mb-2" />
                                <input value={b.caption || ""} onChange={(e) => update(i, { ...b, caption: e.target.value })} placeholder="Caption (optional)" maxLength={300} className={inputCls} />
                            </>
                        ) : (
                            <textarea
                                value={b.text}
                                onChange={(e) => update(i, { ...b, text: e.target.value })}
                                placeholder={b.type === "heading" ? "Section heading" : "Write here. Leave a blank line between paragraphs."}
                                rows={b.type === "heading" ? 1 : 6}
                                className={`${inputCls} ${b.type === "heading" ? "text-lg font-bold" : ""}`}
                            />
                        )}
                    </div>
                ))}

                <div className="flex flex-wrap gap-3 text-sm">
                    <button type="button" onClick={() => setBlocks((p) => [...p, { type: "text", text: "" }])} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">+ Text</button>
                    <button type="button" onClick={() => setBlocks((p) => [...p, { type: "heading", text: "" }])} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">+ Heading</button>
                    <label className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer">
                        {uploading ? "Uploading…" : "+ Image"}
                        <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => { addImage(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg text-white/70 hover:text-white">Cancel</button>
                    <button type="button" onClick={save} disabled={saving || uploading || !title.trim()} className="px-5 py-2 rounded-lg bg-[#FF4E27] hover:bg-[#e5431f] font-medium disabled:opacity-50">
                        {saving ? "Saving…" : slug ? "Save changes" : "Publish"}
                    </button>
                </div>
            </div>
        </BlogShell>
    );
}
