"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Post from "@/components/Posts/Post";
import { PostProps } from "@/lib/types";
import styles from "./feed.module.css";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
import { type communityDataFromAPI } from "@/types/communityGetAllAPIData";
import { useSearchParams } from "next/navigation";
import SearchDropdown from "@/components/ui/SearchDropdown";
import { getFontClass } from "@/utils/getFontClass";
import { useLanguage } from "@/context/LanguageContext";

export default function Page() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<communityDataFromAPI[] | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlight");
    const [highlightedPost, setHighlightedPost] = useState<string | null>(highlightId);
    const postRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [feedSearchQuery, setFeedSearchQuery] = useState("");
    const montserrat = getFontClass("montserrat");
    const { t } = useLanguage();

    useEffect(() => {
        if (highlightedPost && posts.length > 0) {
            const el = postRefs.current[highlightedPost];
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => setHighlightedPost(null), 3000);
            }
        }
    }, [highlightedPost, posts]);

    const fetchPosts = async (userId: string) => {
        try {
            const res = await fetch(`/api/community/posts?userId=${userId}`);
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data)) return;
            const processed = data.map((p: any) => {
                const cMap: any = {};
                const topLevel: any[] = [];
                (p.comments || []).forEach((c: any) => { cMap[c.comment_id] = { ...c, replies: [] }; });
                (p.comments || []).forEach((c: any) => {
                    if (c.parent_comment_id && cMap[c.parent_comment_id]) {
                        cMap[c.parent_comment_id].replies.push(cMap[c.comment_id]);
                    } else if (!c.parent_comment_id) {
                        topLevel.push(cMap[c.comment_id]);
                    }
                });
                return { ...p, comments: topLevel, likes: p.likes || [] };
            });
            setPosts(processed);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        fetchPosts(user.id);
        (async () => {
            try {
                const [subRes, profileRes] = await Promise.all([
                    fetch(`/api/community/subscribe?user_id=${user.id}`),
                    fetch(`/api/users/${user.id}`)
                ]);
                if (subRes.ok) {
                    const json = await subRes.json();
                    setSubscriptions(json.communities);
                }
                if (profileRes.ok) {
                    setUserProfile(await profileRes.json());
                }
            } catch (err: any) {
                toast.error(err.message || "Error fetching data");
            }
        })();
    }, [user]);

    useEffect(() => {
        if (!user?.id) return;
        const interval = setInterval(() => fetchPosts(user.id), 2000);
        return () => clearInterval(interval);
    }, [user]);

    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    return (
        <div className="flex">
            <main className="md:ml-[54px] px-4 md:px-8 py-6 w-full md:w-[70%]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center mt-6 mb-8 gap-4 w-full">
                    <h1 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px] flex-shrink-0`}>
                        POSTS
                    </h1>
                    <div className="flex-1 flex justify-center w-full">
                        <div className="w-full max-w-[437px]">
                            <SearchDropdown
                                apiEndpoint=""
                                placeholder={t("Search posts...")}
                                mode="filter"
                                onFilter={useCallback((q: string) => setFeedSearchQuery(q), [])}
                            />
                        </div>
                    </div>
                </div>

                {/* Posts */}
                <div className="flex flex-col items-center justify-center">
                    {posts.filter((post: PostProps) => {
                        if (!feedSearchQuery.trim()) return true;
                        const q = feedSearchQuery.toLowerCase();
                        return (
                            post.content_text?.toLowerCase().includes(q) ||
                            post.artist?.artist_name?.toLowerCase().includes(q)
                        );
                    }).map((post: PostProps) => (
                        <div
                            key={post.post_id}
                            ref={(el) => { postRefs.current[post.post_id] = el; }}
                            className={`contents ${highlightedPost === post.post_id ? "[&>*]:ring-2 [&>*]:ring-[#FF4E27] [&>*]:ring-offset-4 [&>*]:ring-offset-[#1a1625] [&>*]:rounded-xl [&>*]:transition-all [&>*]:duration-500" : ""}`}
                        >
                            <Post
                                post={post}
                                user_id={userId}
                                userProfilePicture={userProfile?.profile_picture_url || user?.photoURL}
                            />
                        </div>
                    ))}
                </div>
            </main>

            {/* Right Sidebar */}
            <div
                className="fixed right-0 w-[330px] h-full p-6 border-l border-[rgba(90,90,90,0.50)] hidden md:block"
                style={{ background: "rgba(0,0,0,0.20)" }}
            >
                <h2 className={`${montserrat} text-[#FAF9F6] text-[24px] font-bold leading-[29px] mb-8 mt-6`}>
                    My Subscriptions
                </h2>
                {subscriptions ? (
                    <div className="flex flex-col gap-[20px]">
                        {subscriptions.map((element) => (
                            <Link
                                className={`${styles.subscription}`}
                                href={`/community/${element.artist_slug}`}
                                key={element.artist_slug}
                            >
                                <img
                                    src={
                                        getImageUrl(element.artist_profile_picture_url) ||
                                        getImageUrl(element.artist_cover_photo_url) ||
                                        getImageUrl(DEFAULT_PROFILE_IMAGE)
                                    }
                                    alt="Avatar"
                                    className="w-[53px] h-[53px] rounded-full object-cover mr-4"
                                />
                                <span className={`${montserrat} text-white/80 text-[16px] font-medium leading-[19px]`}>
                                    {element.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={`${montserrat} text-white/50 text-[14px]`}>Loading subscriptions...</div>
                )}
            </div>
        </div>
    );
}
