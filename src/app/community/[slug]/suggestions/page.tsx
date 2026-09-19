"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import { uploadToS3 } from "@/utils/uploadToS3";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import CommunityHeader from "@/components/CommunityHeader";

// Suggestions: a minimal, realtime board where subscribers post suggestions (text + image)
// and react. Only the community's artist can reply to a suggestion (backend-enforced too).
const REACTIONS = ["👍", "❤️", "🔥", "💡"];

interface Msg {
    forum_post_id: string;
    user_id: string;
    content: string;
    media_urls: string[];
    created_at: string;
    parent_post_id?: string | null;
    reactions?: { [emoji: string]: string[] };
    user?: { user_id: string; username: string; full_name: string; profile_picture_url: string };
}

export default function SuggestionsPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [forumId, setForumId] = useState<string | null>(null);
    const [isArtist, setIsArtist] = useState(false);
    const [communityName, setCommunityName] = useState<string>("Community");
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<Msg[]>([]);
    const [replies, setReplies] = useState<Record<string, Msg[]>>({});
    const [input, setInput] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [posting, setPosting] = useState(false);
    const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Resolve community + suggestions forum + artist ownership.
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/community/${slug}`, { cache: "no-store" });
                if (!res.ok) { toast.error("Community not found"); router.push("/feed"); return; }
                const data = await res.json();
                const commId = data.artist?.community?.community_id;
                if (!commId) { toast.error("Community not found"); router.push("/feed"); return; }
                setCommunityName(data.artist?.community?.name || data.artist?.artist_name || "Community");

                const meRes = await fetch(`/api/artist/me`);
                if (meRes.ok) {
                    const me = await meRes.json();
                    setIsArtist(user?.role === "artist" && me.artist?.community?.community_id === commId);
                }

                const fRes = await fetch(`/api/communities/${commId}/forums`);
                if (fRes.ok) {
                    const fData = await fRes.json();
                    const forum = fData.forums.find((f: any) => f.forum_type === "suggestions");
                    if (forum) setForumId(forum.forum_id);
                    else toast.error("Suggestions unavailable");
                }
            } catch { toast.error("Failed to load suggestions"); }
            finally { setLoading(false); }
        })();
    }, [slug, user, router]);

    // Load messages + split top-level vs replies.
    useEffect(() => {
        if (!forumId) return;
        (async () => {
            const res = await fetch(`/api/forums/${forumId}/messages`);
            if (!res.ok) return;
            const { messages } = await res.json();
            const tops: Msg[] = [];
            const reps: Record<string, Msg[]> = {};
            for (const m of messages as Msg[]) {
                if (m.parent_post_id) (reps[m.parent_post_id] ||= []).push(m);
                else tops.push(m);
            }
            setSuggestions(tops);
            setReplies(reps);
        })();
    }, [forumId]);

    // Realtime: new suggestions/replies + reaction updates.
    useEffect(() => {
        if (!forumId || !user) return;
        const channel = supabase.channel(`forum:${forumId}`)
            .on("postgres_changes",
                { event: "INSERT", schema: "public", table: "forum_posts", filter: `forum_id=eq.${forumId}` },
                async (payload) => {
                    const r = await fetch(`/api/users/${payload.new.user_id}`);
                    const u = r.ok ? (await r.json()).user : null;
                    const m: Msg = { ...(payload.new as any), user: u || undefined, reactions: payload.new.reactions || {} };
                    if (m.parent_post_id) {
                        const p = m.parent_post_id;
                        setReplies((prev) => ({ ...prev, [p]: [...(prev[p] || []), m] }));
                    } else {
                        setSuggestions((prev) => (prev.some(x => x.forum_post_id === m.forum_post_id) ? prev : [...prev, m]));
                    }
                })
            .on("postgres_changes",
                { event: "UPDATE", schema: "public", table: "forum_posts", filter: `forum_id=eq.${forumId}` },
                (payload) => {
                    const upd = (arr: Msg[]) => arr.map(x => x.forum_post_id === payload.new.forum_post_id ? { ...x, reactions: payload.new.reactions || {} } : x);
                    setSuggestions((prev) => upd(prev));
                    setReplies((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, upd(v)])));
                })
            .subscribe();
        return () => { channel.unsubscribe(); };
    }, [forumId, user]);

    async function post(content: string, parentId: string | null, image: File | null) {
        if (!forumId || (!content.trim() && !image)) return;
        let mediaUrls: string[] = [];
        if (image) {
            const key = `suggestions/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
            mediaUrls = [await uploadToS3(image, key)];
        }
        const res = await fetch(`/api/forums/${forumId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, media_urls: mediaUrls, media_type: mediaUrls.length ? "image" : "text", parent_post_id: parentId }),
        });
        if (!res.ok) { toast.error((await res.json().catch(() => ({}))).error || "Failed"); return false; }
        return true;
    }

    async function submitSuggestion() {
        setPosting(true);
        const ok = await post(input, null, file);
        setPosting(false);
        if (ok) { setInput(""); setFile(null); }
    }

    async function submitReply(parentId: string) {
        const draft = replyDraft[parentId] || "";
        if (!draft.trim()) return;
        const ok = await post(draft, parentId, null);
        if (ok) setReplyDraft((p) => ({ ...p, [parentId]: "" }));
    }

    async function react(postId: string, emoji: string) {
        const res = await fetch(`/api/forums/${forumId}/messages/${postId}/react`, {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emoji }),
        });
        if (!res.ok) return;
        const { reactions } = await res.json();
        const upd = (arr: Msg[]) => arr.map(x => x.forum_post_id === postId ? { ...x, reactions } : x);
        setSuggestions((prev) => upd(prev));
        setReplies((prev) => Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, upd(v)])));
    }

    return (
        <div className={`min-h-screen text-white ${!isArtist ? "md:ml-[54px]" : ""}`}
            style={{ background: "linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 70%, #0a0612 100%)" }}>
            <Navbar />
            <CommunityHeader slug={slug} communityName={communityName} isSubscribed={true} isArtist={isArtist} currentPage="suggestions" />

            <main className="max-w-4xl mx-auto px-4 pt-24 pb-40">
                <h1 className="text-2xl font-bold text-[#FFD3C9] mb-1">Suggestions</h1>
                <p className="text-sm text-gray-400 mb-6">Share ideas with the artist. Everyone can react; only the artist replies.</p>

                {loading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : suggestions.length === 0 ? (
                    <p className="text-gray-500">No suggestions yet. Be the first!</p>
                ) : (
                    <div className="space-y-4">
                        {suggestions.map((m) => (
                            <div key={m.forum_post_id} className="rounded-xl bg-[#1a1625] border border-gray-800 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={getImageUrl(m.user?.profile_picture_url)} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-700" />
                                    <span className="text-sm font-semibold">{m.user?.username || "User"}</span>
                                </div>
                                {m.content && <p className="text-[15px] text-gray-200 whitespace-pre-wrap">{m.content}</p>}
                                {m.media_urls?.[0] && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={getImageUrl(m.media_urls[0])} alt="" className="mt-2 rounded-lg max-h-72 object-cover" />
                                )}
                                {/* reactions */}
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    {REACTIONS.map((e) => {
                                        const count = m.reactions?.[e]?.length || 0;
                                        const mine = !!(user && m.reactions?.[e]?.includes(user.id));
                                        return (
                                            <button key={e} onClick={() => react(m.forum_post_id, e)}
                                                className={`text-sm rounded-full px-2 py-0.5 border ${mine ? "border-[#FA6400] bg-[#FA6400]/20" : "border-gray-700 hover:border-gray-500"}`}>
                                                {e}{count > 0 ? ` ${count}` : ""}
                                            </button>
                                        );
                                    })}
                                </div>
                                {/* replies (artist responses) */}
                                {(replies[m.forum_post_id] || []).map((r) => (
                                    <div key={r.forum_post_id} className="mt-3 ml-4 border-l-2 border-[#FA6400]/40 pl-3">
                                        <span className="text-xs font-semibold text-[#FA6400]">{r.user?.username || "Artist"} (artist)</span>
                                        {r.content && <p className="text-sm text-gray-300">{r.content}</p>}
                                    </div>
                                ))}
                                {/* artist-only reply box */}
                                {isArtist && (
                                    <div className="mt-3 flex gap-2">
                                        <input value={replyDraft[m.forum_post_id] || ""} onChange={(e) => setReplyDraft((p) => ({ ...p, [m.forum_post_id]: e.target.value }))}
                                            placeholder="Reply as artist…" className="flex-1 bg-[#2d2838] rounded-full px-3 py-1.5 text-sm outline-none" />
                                        <button onClick={() => submitReply(m.forum_post_id)} className="text-[#FA6400] text-sm font-semibold">Send</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* compose bar */}
            <div className="fixed bottom-0 left-0 right-0 p-3 pb-6">
                {file && (
                    <div className="max-w-4xl mx-auto mb-2">
                        <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={URL.createObjectURL(file)} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-gray-700" />
                            <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm" aria-label="Remove image">×</button>
                        </div>
                    </div>
                )}
                <div className="max-w-4xl mx-auto flex items-center gap-3 bg-[#3d3848] rounded-full px-4 py-3">
                    <button onClick={() => fileInputRef.current?.click()} disabled={posting}
                        className="text-gray-400 hover:text-white transition flex-shrink-0" aria-label="Attach image">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    <input value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !posting) submitSuggestion(); }}
                        placeholder="Share a suggestion…"
                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none min-w-0" />
                    <button onClick={submitSuggestion} disabled={posting || (!input.trim() && !file)}
                        className="text-[#FA6400] disabled:opacity-40 font-semibold flex-shrink-0">
                        {posting ? "…" : "Post"}
                    </button>
                </div>
            </div>
            <MobileNav />
        </div>
    );
}
