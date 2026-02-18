"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CommunityHeader from "@/components/CommunityHeader";
import Navbar from "@/components/Navbar";
import { FaImage, FaPaperPlane, FaTimes } from "react-icons/fa";
import { PostProps } from "@/lib/types";
import ForumPost from "@/components/ForumPost";

interface CommunityData {
    artist_name: string;
    community_name: string;
    profile_picture_url: string;
    subscriber_count: number;
    artist_id: string;
}

export default function ArtistForumPage() {
    const { user } = useAuth();
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();

    const [posts, setPosts] = useState<PostProps[]>([]);
    const [contentText, setContentText] = useState("");
    const [communityId, setCommunityId] = useState<string | null>(null);
    const [communityData, setCommunityData] = useState<CommunityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isArtist, setIsArtist] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch posts function
    const fetchPosts = async (commId: string) => {
        try {
            const res = await fetch(`/api/community/posts?communityId=${commId}`);
            if (!res.ok) return;
            const data = await res.json();
            
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
        async function init() {
            try {
                const res = await fetch(`/api/community/${slug}`);
                if (!res.ok) throw new Error("Community not found");

                const data = await res.json();
                const commId = data.artist?.community?.community_id;
                const artistId = data.artist?.artist_id;

                setCommunityId(commId);
                setCommunityData({
                    artist_name: data.artist?.artist_name,
                    community_name: data.artist?.community?.name,
                    profile_picture_url: data.artist?.profile_picture_url,
                    subscriber_count: data.artist?.community?.subscriber_count || 0,
                    artist_id: artistId
                });

                if (user?.id) {
                    const [artistRes, subRes, profileRes] = await Promise.all([
                        fetch(`/api/artist/me?userId=${user.id}`),
                        fetch(`/api/community/subscribe?user_id=${user.id}`),
                        fetch(`/api/users/${user.id}`)
                    ]);

                    if (artistRes.ok) {
                        const artistData = await artistRes.json();
                        setIsArtist(user.role === "artist" && artistData.artist?.artist_id === artistId);
                    }

                    if (subRes.ok) {
                        const subData = await subRes.json();
                        setIsSubscribed(subData.communities?.some((c: any) => c.id === commId || c.community_id === commId) || false);
                    }

                    if (profileRes.ok) {
                        setUserProfile(await profileRes.json());
                    }
                }

                if (commId) await fetchPosts(commId);
                setLoading(false);
            } catch (error) {
                console.error("Error:", error);
                toast.error("Failed to load community");
                setLoading(false);
            }
        }

        if (slug) init();
    }, [slug, user]);

    // Polling for updates
    useEffect(() => {
        if (!communityId) return;
        
        const interval = setInterval(() => fetchPosts(communityId), 2000);
        return () => clearInterval(interval);
    }, [communityId]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitPost = async () => {
        if (!contentText.trim() && selectedFiles.length === 0) {
            toast.error("Please add content or media");
            return;
        }

        if (!isArtist) {
            toast.error("Only artists can create posts");
            return;
        }

        setIsUploading(true);

        try {
            let mediaUrls: string[] = [];

            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach(file => formData.append('files', file));

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error("Failed to upload media");
                const uploadData = await uploadRes.json();
                mediaUrls = uploadData.urls;
            }

            const postRes = await fetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    artist_id: communityData?.artist_id,
                    community_id: communityId,
                    content_text: contentText,
                    media_urls: mediaUrls
                })
            });

            if (!postRes.ok) throw new Error("Failed to create post");

            setContentText("");
            setSelectedFiles([]);
            toast.success("Post created!");
            
            // Immediate refetch
            if (communityId) await fetchPosts(communityId);
        } catch (error) {
            console.error("Error creating post:", error);
            toast.error("Failed to create post");
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-[#1a1625] text-white">Loading...</div>;
    }

    if (!isSubscribed && !isArtist) {
        return (
            <div className="min-h-screen bg-[#1a1625] text-white flex items-center justify-center">
                {user?.role !== "artist" && <Navbar />}
                <div className="text-center">
                    <p className="text-xl mb-4">Subscribe to access the Artist Forum</p>
                    <button onClick={() => router.push(`/community/${slug}`)} className="px-6 py-2 bg-[#FA6400] rounded-lg hover:bg-[#e55a00] transition">
                        Go to Community
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1625] text-white">
            {user?.role !== "artist" && <Navbar />}
            <CommunityHeader
                slug={slug}
                communityName={communityData?.community_name || ""}
                isSubscribed={isSubscribed}
                isArtist={isArtist}
                currentPage="forum"
            />

            <div className="w-full px-6 pt-20 pb-8 ml-16">
                <div className="max-w-4xl mx-auto">
                    {isArtist && (
                        <div className="bg-[#2d2838] rounded-xl p-6 mb-6 shadow-lg border border-gray-700/50">
                            <textarea
                                value={contentText}
                                onChange={(e) => setContentText(e.target.value)}
                                placeholder="Share something with your community..."
                className="w-full bg-[#1a1625] text-white rounded-lg p-4 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF4E27] placeholder-gray-400 border border-gray-700"
                                rows={3}
                            />

                            {selectedFiles.length > 0 && (
                                <div className="grid grid-cols-5 gap-3 mb-4">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="relative group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${idx}`}
                                                className="w-full h-20 object-cover rounded-lg border border-gray-600"
                                            />
                                            <button
                                                onClick={() => removeFile(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1a1625] text-gray-300 rounded-lg hover:bg-[#252030] transition-colors border border-gray-700"
                                >
                                    <FaImage size={16} /> Add Media
                                </button>
                                <button
                                    onClick={handleSubmitPost}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    <FaPaperPlane size={14} /> {isUploading ? "Posting..." : "Post"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-5">
                        {posts.map((post) => (
                            <ForumPost 
                                key={post.post_id} 
                                post={post} 
                                user_id={user?.id || ""} 
                                userProfilePicture={userProfile?.profile_picture_url || user?.photoURL}
                            />
                        ))}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center text-gray-400 py-20 bg-[#2d2838] rounded-xl border border-gray-700/50">
                            <p className="text-xl font-medium mb-2">No posts yet</p>
                            {isArtist && <p className="text-sm text-gray-500">Be the first to share something with your community!</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
