"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch } from "react-icons/fa";
import Post from "@/components/Posts/Post";
import { PostProps } from "@/lib/types";
import styles from "./feed.module.css";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import toast from "react-hot-toast";
import BaseText from "@/components/BaseText/BaseText";
import Link from "next/link";
import { type communityDataFromAPI } from "@/types/communityGetAllAPIData";
import { useSearchParams } from "next/navigation";
import SearchDropdown from "@/components/ui/SearchDropdown";

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

    // Scroll to highlighted post and clear after 3s
    useEffect(() => {
        if (highlightedPost && posts.length > 0) {
            const el = postRefs.current[highlightedPost];
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => setHighlightedPost(null), 3000);
            }
        }
    }, [highlightedPost, posts]);

    // Fetch posts function
    const fetchPosts = async (userId: string) => {
        try {
            const res = await fetch(`/api/community/posts?userId=${userId}`);
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data)) return;
            
            // Process posts with proper nesting
            const processed = data.map((p: any) => {
                const cMap: any = {};
                const topLevel: any[] = [];
                
                (p.comments || []).forEach((c: any) => {
                    cMap[c.comment_id] = { ...c, replies: [] };
                });
                
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

    // Initial load
    useEffect(() => {
        if (!user?.id) return;
        
        fetchPosts(user.id);
        
        // Fetch subscriptions and profile
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

    // Polling for updates
    useEffect(() => {
        if (!user?.id) return;
        
        const interval = setInterval(() => fetchPosts(user.id), 2000);
        return () => clearInterval(interval);
    }, [user]);

    const userId = user?.id || "33333333-3333-3333-3333-333333333333";

    return (
        <>
            <div className="flex">
                <main className="ml-16 px-8 py-6 w-[70%]">
                    <div className="flex justify-between items-center mt-6 mb-8 w-full">
                        <BaseHeading
                            headingLevel="h1"
                            textColor="#ffffff"
                            fontSize="sub heading"
                            fontWeight={700}
                            className="mx-auto"
                        >
                            Posts
                        </BaseHeading>
                        <div className="w-full max-w-2xl mx-auto">
                            <SearchDropdown
                                apiEndpoint=""
                                placeholder="Search posts..."
                                mode="filter"
                                onFilter={useCallback((q: string) => setFeedSearchQuery(q), [])}
                            />
                        </div>
                    </div>
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
                <div className="fixed right-0 bg-[#1a0a2e] p-2 w-[23%] h-full">
                    <div className="flex flex-col items-center">
                        <BaseHeading
                            headingLevel="h2"
                            textColor="#ffffff"
                            fontWeight={700}
                            fontSize="sub heading"
                            className="mt-5 mb-8"
                        >
                            My Subscriptions
                        </BaseHeading>
                    </div>
                    {subscriptions ? (
                        <div className="flex items-start justify-center p-2 flex-col">
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
                                        alt={`Avatar`}
                                        className="w-12 h-12 rounded-full object-cover mr-3"
                                        width={100}
                                        height={100}
                                    />
                                    <div className={styles.text}>
                                        <BaseText
                                            wrapper="span"
                                            fontWeight={500}
                                            textColor="inherit"
                                            fontSize="large"
                                        >
                                            {element.name}
                                        </BaseText>
                                        <div className={styles.separator}></div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div>loading subscriptions...</div>
                    )}
                </div>
            </div>
        </>
    );
}
