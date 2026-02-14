"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import { useCommunityPresence } from "@/hooks/useCommunityPresence";
import CommunityHeader from "@/components/CommunityHeader";
import Navbar from "@/components/Navbar";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

interface Message {
    forum_post_id: string;
    user_id: string;
    content: string;
    media_urls: string[];
    is_pinned: boolean;
    created_at: string;
    parent_post_id?: string;
    reactions?: { [emoji: string]: string[] };
    replyCount?: number;
    user?: {
        user_id: string;
        username: string;
        full_name: string;
        profile_picture_url: string;
    };
}

interface CommunityData {
    artist_name: string;
    community_name: string;
    profile_picture_url: string;
    subscriber_count: number;
    online_count: number;
    socials: Array<{ platform: string; url: string }>;
}

export default function AllChatPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [forumId, setForumId] = useState<string | null>(null);
    const [communityId, setCommunityId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isArtist, setIsArtist] = useState(false);
    const [showOnlineList, setShowOnlineList] = useState(false);
    const [communityData, setCommunityData] = useState<CommunityData | null>(
        null
    );
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
        null
    );
    const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
        new Set()
    );
    const [threadReplies, setThreadReplies] = useState<{
        [key: string]: Message[];
    }>({});
    const [searchQuery, setSearchQuery] = useState("");

    const {
        onlineUsers,
        onlineUserDetails,
        onlineCount,
        typingUsers,
        broadcastTyping,
    } = useCommunityPresence(communityId);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastTypingBroadcastRef = useRef<number>(0);
    const onlineListRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch community ID from slug first, then forum ID
    useEffect(() => {
        async function fetchCommunityAndForum() {
            try {
                // slug could be either the actual slug OR a UUID (community_id)
                // Try fetching as slug first
                const artistRes = await fetch(`/api/community/${slug}`);

                let commId: string | null = null;
                let artistData: any = null;

                if (artistRes.ok) {
                    // Parse JSON once and store it
                    artistData = await artistRes.json();
                    commId = artistData.artist?.community?.community_id;
                } else if (
                    slug.match(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                    )
                ) {
                    // It's a UUID, use it directly as community_id
                    commId = slug;
                }

                if (!commId) {
                    toast.error("Community not found");
                    router.push("/feed");
                    return;
                }

                setCommunityId(commId);

                // Fetch community data for sidebar
                if (artistData) {
                    // Fetch subscriber count for this specific community
                    const subsRes = await fetch(
                        `/api/communities/${commId}/subscribers`
                    );
                    let subscriberCount = 0;
                    if (subsRes.ok) {
                        const subsData = await subsRes.json();
                        subscriberCount = subsData.count || 0;
                    } else {
                        // Fallback: count from CommunitySubscription table
                        const allSubsRes = await fetch(
                            `/api/community/subscribe`
                        );
                        if (allSubsRes.ok) {
                            const allSubsData = await allSubsRes.json();
                            subscriberCount =
                                allSubsData.communities?.filter(
                                    (c: any) => c.id === commId
                                ).length || 0;
                        }
                    }

                    // console.log('Community data:', {
                    //   artist_name: artistData.artist?.artist_name,
                    //   community_name: artistData.artist?.community?.name,
                    //   socials: artistData.artist?.socials,
                    //   subscriberCount
                    // });

                    setCommunityData({
                        artist_name:
                            artistData.artist?.artist_name || "Community",
                        community_name:
                            artistData.artist?.community?.name ||
                            artistData.artist?.artist_name ||
                            "Community",
                        profile_picture_url:
                            artistData.artist?.profile_picture_url || "",
                        subscriber_count: subscriberCount,
                        online_count: 0,
                        socials: artistData.artist?.socials || [],
                    });
                }

                // Check if current user is the artist
                const artistCheckRes = await fetch(`/api/artist/me`);
                if (artistCheckRes.ok) {
                    const artistData = await artistCheckRes.json();
                    setIsArtist(
                        user?.role === "artist" && artistData.artist?.community?.community_id === commId
                    );
                }

                // Now fetch forums using community_id
                const forumsRes = await fetch(
                    `/api/communities/${commId}/forums`
                );
                if (forumsRes.ok) {
                    const forumsData = await forumsRes.json();
                    const chatForum = forumsData.forums.find(
                        (f: any) => f.forum_type === "all_chat"
                    );
                    if (chatForum) {
                        setForumId(chatForum.forum_id);
                    } else {
                        setLoading(false);
                        toast.error(
                            "Chat forum not found. Please contact admin."
                        );
                        router.push("/feed");
                    }
                } else {
                    setLoading(false);
                    toast.error("Failed to load forum");
                    router.push("/feed");
                }
            } catch (error) {
                console.error("Error fetching forum:", error);
                setLoading(false);
                toast.error("Failed to load chat");
                router.push(`/community/${slug}`);
            }
        }

        if (user && slug) {
            fetchCommunityAndForum();
        }
    }, [slug, router, user]);

    // Initialize Supabase Realtime
    useEffect(() => {
        if (!user || !forumId) return;

        // Test Supabase connection
        // console.log('🔵 Testing Supabase connection:', {
        //   url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        //   hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        //   forumId,
        //   userId: user.id
        // });

        // Fetch initial messages
        fetchMessages();

        // Create Realtime channel for this forum (messages only)
        const messageChannel = supabase.channel(`forum:${forumId}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        // Subscribe to new messages (INSERT events)
        messageChannel
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "forum_posts",
                    filter: `forum_id=eq.${forumId}`,
                },
                async (payload) => {
                    // Fetch user details via API route (bypasses RLS)
                    const userRes = await fetch(
                        `/api/users/${payload.new.user_id}`
                    );
                    const { user: userData } = userRes.ok
                        ? await userRes.json()
                        : { user: null };

                    const newMessage: Message = {
                        ...(payload.new as any),
                        user: userData || undefined,
                        reactions: payload.new.reactions || {},
                    };

                    // If it's a reply, add to thread replies instead of main messages
                    if (newMessage.parent_post_id) {
                        const parentId = newMessage.parent_post_id;
                        setThreadReplies((prev) => ({
                            ...prev,
                            [parentId]: [...(prev[parentId] || []), newMessage],
                        }));

                        // Update reply count for parent message
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.forum_post_id === parentId
                                    ? {
                                          ...msg,
                                          replyCount: (msg.replyCount || 0) + 1,
                                      }
                                    : msg
                            )
                        );
                    } else {
                        setMessages((prev) => [...prev, newMessage]);
                        setTimeout(scrollToBottom, 100);
                    }
                }
            )
            // Subscribe to message updates (PIN events and REACTIONS)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "forum_posts",
                    filter: `forum_id=eq.${forumId}`,
                },
                (payload) => {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.forum_post_id === payload.new.forum_post_id
                                ? {
                                      ...msg,
                                      is_pinned: payload.new.is_pinned,
                                      reactions: payload.new.reactions || {},
                                  }
                                : msg
                        )
                    );

                    // Update thread replies if exists
                    if (payload.new.parent_post_id) {
                        const parentId = payload.new.parent_post_id as string;
                        setThreadReplies((prev) => ({
                            ...prev,
                            [parentId]: (prev[parentId] || []).map((reply) =>
                                reply.forum_post_id ===
                                payload.new.forum_post_id
                                    ? {
                                          ...reply,
                                          reactions:
                                              payload.new.reactions || {},
                                      }
                                    : reply
                            ),
                        }));
                    }

                    if (payload.new.is_pinned && !payload.old?.is_pinned) {
                        toast.success("Message pinned");
                    }
                }
            )
            .subscribe((status) => {
                console.log("Message channel status:", status);

                if (status === "SUBSCRIBED") {
                    setIsConnected(true);
                    toast.success("Connected to chat");
                } else if (status === "CLOSED") {
                    setIsConnected(false);
                } else if (status === "CHANNEL_ERROR") {
                    toast.error("Failed to connect to chat");
                }
            });

        return () => {
            messageChannel.unsubscribe();
        };
    }, [user, forumId]);

    const fetchMessages = async () => {
        if (!forumId) return;

        try {
            setLoading(true);

            // Fetch parent messages from Supabase
            const { data, error } = await supabase
                .from("forum_posts")
                .select("*")
                .eq("forum_id", forumId)
                .is("parent_post_id", null)
                .order("created_at", { ascending: true })
                .limit(50);

            if (error) throw error;

            // Fetch user details and reply counts for each message
            const messagesWithUsers = await Promise.all(
                (data || []).map(async (msg) => {
                    const userRes = await fetch(`/api/users/${msg.user_id}`);
                    const { user: userData } = userRes.ok
                        ? await userRes.json()
                        : { user: null };

                    // Get reply count
                    const { count } = await supabase
                        .from("forum_posts")
                        .select("*", { count: "exact", head: true })
                        .eq("parent_post_id", msg.forum_post_id);

                    return {
                        ...msg,
                        user: userData,
                        replyCount: count || 0,
                        reactions: msg.reactions || {},
                    };
                })
            );

            setMessages(messagesWithUsers);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (
            (!inputMessage.trim() && selectedFiles.length === 0) ||
            !forumId ||
            !user
        )
            return;

        try {
            setIsUploading(true);
            let mediaUrls: string[] = [];

            // Upload files to S3 if any
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach((file) => formData.append("files", file));

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Failed to upload files");
                const uploadData = await uploadRes.json();
                mediaUrls = uploadData.urls || [];
            }

            // Insert message via Supabase
            const { data, error } = await supabase
                .from("forum_posts")
                .insert({
                    forum_id: forumId,
                    user_id: user.id,
                    content: inputMessage || "",
                    media_type: mediaUrls.length > 0 ? "image" : "text",
                    media_urls: mediaUrls,
                    parent_post_id: replyingTo?.forum_post_id || null,
                })
                .select()
                .single();

            if (error) {
                console.error("Supabase insert error:", error);
                throw error;
            }

            setInputMessage("");
            setSelectedFiles([]);
            setReplyingTo(null);
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsUploading(false);
        }
    };

    const addReaction = async (postId: string, emoji: string) => {
        try {
            const res = await fetch(
                `/api/forums/${forumId}/messages/${postId}/react`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user?.id, emoji }),
                }
            );

            if (!res.ok) throw new Error("Failed to add reaction");

            const { reactions } = await res.json();

            // Update local state
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.forum_post_id === postId ? { ...msg, reactions } : msg
                )
            );
        } catch (error) {
            console.error("Error adding reaction:", error);
            toast.error("Failed to add reaction");
        }
    };

    const toggleThread = async (postId: string) => {
        const isExpanded = expandedThreads.has(postId);

        if (isExpanded) {
            setExpandedThreads((prev) => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        } else {
            // Fetch replies
            const { data, error } = await supabase
                .from("forum_posts")
                .select("*")
                .eq("parent_post_id", postId)
                .order("created_at", { ascending: true });

            if (!error && data) {
                const repliesWithUsers = await Promise.all(
                    data.map(async (msg) => {
                        const userRes = await fetch(
                            `/api/users/${msg.user_id}`
                        );
                        const { user: userData } = userRes.ok
                            ? await userRes.json()
                            : { user: null };
                        return {
                            ...msg,
                            user: userData,
                            reactions: msg.reactions || {},
                        };
                    })
                );

                setThreadReplies((prev) => ({
                    ...prev,
                    [postId]: repliesWithUsers,
                }));
            }

            setExpandedThreads((prev) => new Set(prev).add(postId));
        }
    };

    const handleTyping = () => {
        if (!user) return;

        const now = Date.now();
        if (now - lastTypingBroadcastRef.current < 2000) return;
        lastTypingBroadcastRef.current = now;

        broadcastTyping(user.name || "Someone");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles((prev) => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEmojiSelect = (emojiData: EmojiClickData) => {
        setInputMessage((prev) => prev + emojiData.emoji);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const filteredMessages = messages.filter((msg) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            msg.content?.toLowerCase().includes(query) ||
            msg.user?.username?.toLowerCase().includes(query) ||
            msg.user?.full_name?.toLowerCase().includes(query)
        );
    });

    // Close online list when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                onlineListRef.current &&
                !onlineListRef.current.contains(event.target as Node)
            ) {
                setShowOnlineList(false);
            }
        };

        if (showOnlineList) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showOnlineList]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#1a1625]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#1a1625]">
            {user?.role !== "artist" && <Navbar />}
            <CommunityHeader
                slug={slug}
                communityName={communityData?.community_name}
                isSubscribed={true}
                isArtist={isArtist}
                currentPage="all-chat"
            />

            {/* Left Sidebar - Community Info */}
            <div
                className={`bg-[#2d2838] border-r border-gray-700 flex flex-col mt-16 transition-all duration-300 ${
                    isSidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
                }`}
            >
                {/* Community Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex flex-col items-center text-center">
                        <img
                            src={getImageUrl(
                                communityData?.profile_picture_url ||
                                    "images/placeholder.jpg"
                            )}
                            alt={communityData?.artist_name || "Community"}
                            className="w-32 h-32 rounded-full object-cover mb-4"
                        />
                        <h2 className="text-white text-xl font-bold mb-2">
                            {communityData?.community_name || "Community"}
                        </h2>
                        <p className="text-white text-lg">
                            #{communityData?.artist_name || "Loading..."}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-gray-400">
                                {communityData?.subscriber_count || 0} members
                            </span>
                            <div className="relative" ref={onlineListRef}>
                                <button
                                    onClick={() =>
                                        setShowOnlineList(!showOnlineList)
                                    }
                                    className="text-green-500 flex items-center gap-1 hover:text-green-400 transition cursor-pointer"
                                >
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    {onlineCount} online
                                </button>
                                {showOnlineList && (
                                    <div className="absolute top-full left-0 mt-2 bg-[#1a1625] border border-gray-700 rounded-lg shadow-xl z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
                                        <div className="p-3 border-b border-gray-700">
                                            <p className="text-white font-semibold text-sm">
                                                Online Now
                                            </p>
                                        </div>
                                        <div className="p-2">
                                            {Array.from(onlineUsers).map(
                                                (userId) => {
                                                    const userInfo =
                                                        onlineUserDetails.get(
                                                            userId
                                                        );
                                                    return (
                                                        <div
                                                            key={userId}
                                                            className="flex items-center gap-2 p-2 hover:bg-[#2d2838] rounded transition"
                                                        >
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-gray-300 text-sm">
                                                                {userInfo?.username ||
                                                                    "User"}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guidelines Footer */}
                <div className="p-6 border-t border-gray-700">
                    <p className="text-gray-400 text-sm mb-4">
                        Guidelines for {communityData?.artist_name || "Artist"}{" "}
                        Community
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        {communityData?.socials?.map((social, idx) => {
                            const platform = social.platform.toLowerCase();
                            return (
                                <a
                                    key={idx}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition"
                                >
                                    {platform === "twitter" ||
                                    platform === "x" ? (
                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                        </svg>
                                    ) : platform === "instagram" ? (
                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    ) : platform === "youtube" ? (
                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                    ) : platform === "facebook" ? (
                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    ) : null}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col mt-16">
                {/* Toggle Sidebar Button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute left-2 top-20 z-10 bg-[#2d2838] text-white p-2 rounded-full hover:bg-[#3d3848] transition"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isSidebarCollapsed ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        )}
                    </svg>
                </button>

                {/* Chat Header with User Info */}
                <div className="bg-[#2d2838] p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={getImageUrl(
                                    user?.photoURL || "images/placeholder.jpg"
                                )}
                                alt={user?.name || "User"}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="text-white text-xl font-bold">
                                    {user?.name || "User"}
                                </h2>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400">
                                        community joined 12.06.25
                                    </span>
                                    {messages.length > 0 && (
                                        <span className="text-[#FA6400]">
                                            {messages.length} new messages
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="search for messages in chat"
                                className="px-4 py-2 bg-[#1a1625] text-white placeholder-gray-500 rounded-full w-80 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {filteredMessages.length === 0 && !loading && (
                            <div className="text-center py-20">
                                <p className="text-gray-400">
                                    {searchQuery
                                        ? "No messages found matching your search"
                                        : "No messages yet. Start the conversation!"}
                                </p>
                            </div>
                        )}

                        {filteredMessages.map((msg, idx) => {
                            const showDate =
                                idx === 0 ||
                                new Date(
                                    filteredMessages[idx - 1].created_at
                                ).toDateString() !==
                                    new Date(msg.created_at).toDateString();
                            const prevUser =
                                idx > 0
                                    ? filteredMessages[idx - 1].user_id
                                    : null;
                            const showAvatar = msg.user_id !== prevUser;
                            const replies =
                                threadReplies[msg.forum_post_id] || [];
                            const replyCount = msg.replyCount || replies.length;

                            return (
                                <div key={msg.forum_post_id}>
                                    {showDate && (
                                        <div className="flex items-center justify-center my-6">
                                            <div className="h-px bg-gray-700 flex-1"></div>
                                            <span className="px-4 text-gray-400 text-sm">
                                                {new Date(
                                                    msg.created_at
                                                ).toDateString() ===
                                                new Date().toDateString()
                                                    ? "Today"
                                                    : new Date(
                                                          msg.created_at
                                                      ).toLocaleDateString()}
                                            </span>
                                            <div className="h-px bg-gray-700 flex-1"></div>
                                        </div>
                                    )}

                                    <div className="flex gap-3 items-start">
                                        {showAvatar ? (
                                            <img
                                                src={getImageUrl(
                                                    msg.user
                                                        ?.profile_picture_url ||
                                                        "images/placeholder.jpg"
                                                )}
                                                alt={
                                                    msg.user?.username || "User"
                                                }
                                                className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 flex-shrink-0"></div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            {showAvatar && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-semibold">
                                                        {msg.user?.full_name ||
                                                            msg.user
                                                                ?.username ||
                                                            "Unknown User"}
                                                    </span>
                                                    {msg.user_id !==
                                                        prevUser && (
                                                        <span className="text-gray-500 text-xs">
                                                            last active{" "}
                                                            {new Date(
                                                                msg.created_at
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="group">
                                                {/* Reply indicator */}
                                                {msg.parent_post_id && (
                                                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                        <svg
                                                            className="w-3 h-3"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                            />
                                                        </svg>
                                                        Reply to{" "}
                                                        {messages.find(
                                                            (m) =>
                                                                m.forum_post_id ===
                                                                msg.parent_post_id
                                                        )?.user?.username ||
                                                            "message"}
                                                    </div>
                                                )}

                                                <div className="bg-[#FA6400] text-white px-4 py-3 rounded-2xl rounded-tl-sm inline-block max-w-2xl">
                                                    {msg.content && (
                                                        <p className="break-words">
                                                            {msg.content}
                                                        </p>
                                                    )}
                                                    {msg.media_urls &&
                                                        msg.media_urls.length >
                                                            0 && (
                                                            <div className="mt-2 space-y-2">
                                                                {msg.media_urls.map(
                                                                    (
                                                                        url,
                                                                        idx
                                                                    ) => (
                                                                        <img
                                                                            key={
                                                                                idx
                                                                            }
                                                                            src={getImageUrl(
                                                                                url
                                                                            )}
                                                                            alt="Attachment"
                                                                            className="rounded-lg max-w-full cursor-pointer"
                                                                            onClick={() =>
                                                                                window.open(
                                                                                    getImageUrl(
                                                                                        url
                                                                                    ),
                                                                                    "_blank"
                                                                                )
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    <span className="text-xs opacity-80 mt-1 block text-right">
                                                        {new Date(
                                                            msg.created_at
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Reactions */}
                                                {msg.reactions &&
                                                    Object.keys(msg.reactions)
                                                        .length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {Object.entries(
                                                                msg.reactions
                                                            ).map(
                                                                ([
                                                                    emoji,
                                                                    users,
                                                                ]) => (
                                                                    <button
                                                                        key={
                                                                            emoji
                                                                        }
                                                                        onClick={() =>
                                                                            addReaction(
                                                                                msg.forum_post_id,
                                                                                emoji
                                                                            )
                                                                        }
                                                                        className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 transition ${
                                                                            users.includes(
                                                                                user?.id ||
                                                                                    ""
                                                                            )
                                                                                ? "bg-[#FA6400] text-white"
                                                                                : "bg-[#2d2838] text-gray-300 hover:bg-[#3d3848]"
                                                                        }`}
                                                                    >
                                                                        <span>
                                                                            {
                                                                                emoji
                                                                            }
                                                                        </span>
                                                                        <span className="text-xs">
                                                                            {
                                                                                users.length
                                                                            }
                                                                        </span>
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    )}

                                                {/* Action buttons (show on hover) */}
                                                <div className="opacity-0 group-hover:opacity-100 transition flex gap-3 mt-2">
                                                    <button
                                                        onClick={() =>
                                                            setReplyingTo(msg)
                                                        }
                                                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#2d2838]"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                            />
                                                        </svg>
                                                        Reply
                                                    </button>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() =>
                                                                setShowReactionPicker(
                                                                    showReactionPicker ===
                                                                        msg.forum_post_id
                                                                        ? null
                                                                        : msg.forum_post_id
                                                                )
                                                            }
                                                            className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#2d2838]"
                                                        >
                                                            😀 React
                                                        </button>
                                                        {showReactionPicker ===
                                                            msg.forum_post_id && (
                                                            <div className="absolute bottom-full left-0 mb-2 z-10">
                                                                <EmojiPicker
                                                                    onEmojiClick={(
                                                                        emojiData
                                                                    ) => {
                                                                        addReaction(
                                                                            msg.forum_post_id,
                                                                            emojiData.emoji
                                                                        );
                                                                        setShowReactionPicker(
                                                                            null
                                                                        );
                                                                    }}
                                                                    height={350}
                                                                    width={300}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Thread toggle */}
                                                {replyCount > 0 && (
                                                    <button
                                                        onClick={() =>
                                                            toggleThread(
                                                                msg.forum_post_id
                                                            )
                                                        }
                                                        className="text-sm text-blue-400 hover:text-blue-300 mt-2 flex items-center gap-1"
                                                    >
                                                        {expandedThreads.has(
                                                            msg.forum_post_id
                                                        )
                                                            ? "▼"
                                                            : "▶"}{" "}
                                                        {replyCount}{" "}
                                                        {replyCount === 1
                                                            ? "reply"
                                                            : "replies"}
                                                    </button>
                                                )}

                                                {/* Thread replies */}
                                                {expandedThreads.has(
                                                    msg.forum_post_id
                                                ) &&
                                                    replies.length > 0 && (
                                                        <div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-700 pl-4">
                                                            {replies.map(
                                                                (reply) => (
                                                                    <div
                                                                        key={
                                                                            reply.forum_post_id
                                                                        }
                                                                        className="flex gap-2 items-start group"
                                                                    >
                                                                        <img
                                                                            src={getImageUrl(
                                                                                reply
                                                                                    .user
                                                                                    ?.profile_picture_url ||
                                                                                    "images/placeholder.jpg"
                                                                            )}
                                                                            alt={
                                                                                reply
                                                                                    .user
                                                                                    ?.username ||
                                                                                "User"
                                                                            }
                                                                            className="w-8 h-8 rounded-full object-cover"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-white text-sm font-semibold">
                                                                                    {reply
                                                                                        .user
                                                                                        ?.username ||
                                                                                        "Unknown"}
                                                                                </span>
                                                                                <span className="text-gray-500 text-xs">
                                                                                    {new Date(
                                                                                        reply.created_at
                                                                                    ).toLocaleTimeString(
                                                                                        [],
                                                                                        {
                                                                                            hour: "2-digit",
                                                                                            minute: "2-digit",
                                                                                        }
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            <div className="bg-[#3d3848] text-white px-3 py-2 rounded-lg text-sm">
                                                                                {
                                                                                    reply.content
                                                                                }
                                                                                {reply.media_urls &&
                                                                                    reply
                                                                                        .media_urls
                                                                                        .length >
                                                                                        0 && (
                                                                                        <div className="mt-2 space-y-1">
                                                                                            {reply.media_urls.map(
                                                                                                (
                                                                                                    url,
                                                                                                    idx
                                                                                                ) => (
                                                                                                    <img
                                                                                                        key={
                                                                                                            idx
                                                                                                        }
                                                                                                        src={getImageUrl(
                                                                                                            url
                                                                                                        )}
                                                                                                        alt="Attachment"
                                                                                                        className="rounded max-w-xs cursor-pointer"
                                                                                                        onClick={() =>
                                                                                                            window.open(
                                                                                                                getImageUrl(
                                                                                                                    url
                                                                                                                ),
                                                                                                                "_blank"
                                                                                                            )
                                                                                                        }
                                                                                                    />
                                                                                                )
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                            </div>

                                                                            {/* Reply reactions */}
                                                                            {reply.reactions &&
                                                                                Object.keys(
                                                                                    reply.reactions
                                                                                )
                                                                                    .length >
                                                                                    0 && (
                                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                                        {Object.entries(
                                                                                            reply.reactions
                                                                                        ).map(
                                                                                            ([
                                                                                                emoji,
                                                                                                users,
                                                                                            ]) => (
                                                                                                <button
                                                                                                    key={
                                                                                                        emoji
                                                                                                    }
                                                                                                    onClick={() =>
                                                                                                        addReaction(
                                                                                                            reply.forum_post_id,
                                                                                                            emoji
                                                                                                        )
                                                                                                    }
                                                                                                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition ${
                                                                                                        users.includes(
                                                                                                            user?.id ||
                                                                                                                ""
                                                                                                        )
                                                                                                            ? "bg-[#FA6400] text-white"
                                                                                                            : "bg-[#2d2838] text-gray-300 hover:bg-[#3d3848]"
                                                                                                    }`}
                                                                                                >
                                                                                                    <span>
                                                                                                        {
                                                                                                            emoji
                                                                                                        }
                                                                                                    </span>
                                                                                                    <span className="text-xs">
                                                                                                        {
                                                                                                            users.length
                                                                                                        }
                                                                                                    </span>
                                                                                                </button>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                            {/* Reply action buttons */}
                                                                            <div className="opacity-0 group-hover:opacity-100 transition flex gap-2 mt-1">
                                                                                <div className="relative">
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            setShowReactionPicker(
                                                                                                showReactionPicker ===
                                                                                                    reply.forum_post_id
                                                                                                    ? null
                                                                                                    : reply.forum_post_id
                                                                                            )
                                                                                        }
                                                                                        className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-[#2d2838]"
                                                                                    >
                                                                                        😀
                                                                                        React
                                                                                    </button>
                                                                                    {showReactionPicker ===
                                                                                        reply.forum_post_id && (
                                                                                        <div className="absolute bottom-full left-0 mb-2 z-10">
                                                                                            <EmojiPicker
                                                                                                onEmojiClick={(
                                                                                                    emojiData
                                                                                                ) => {
                                                                                                    addReaction(
                                                                                                        reply.forum_post_id,
                                                                                                        emojiData.emoji
                                                                                                    );
                                                                                                    setShowReactionPicker(
                                                                                                        null
                                                                                                    );
                                                                                                }}
                                                                                                height={
                                                                                                    350
                                                                                                }
                                                                                                width={
                                                                                                    300
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {typingUsers.size > 0 && (
                            <div className="flex items-center gap-3 text-gray-400 text-sm italic">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.4s" }}
                                    ></span>
                                </div>
                                <span>
                                    {Array.from(typingUsers)[0]} is typing...
                                </span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-[#2d2838] p-6 border-t border-gray-700">
                    <div className="max-w-5xl mx-auto">
                        {/* Reply indicator */}
                        {replyingTo && (
                            <div className="mb-2 bg-[#3d3848] rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                        />
                                    </svg>
                                    <span>
                                        Replying to{" "}
                                        <span className="font-semibold">
                                            {replyingTo.user?.username}
                                        </span>
                                    </span>
                                </div>
                                <button
                                    onClick={() => setReplyingTo(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* File Preview */}
                        {selectedFiles.length > 0 && (
                            <div className="mb-4 flex flex-wrap gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="relative bg-[#3d3848] rounded-lg p-2 flex items-center gap-2"
                                    >
                                        <span className="text-white text-sm">
                                            {file.name}
                                        </span>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3 bg-[#3d3848] rounded-full px-4 py-3 relative">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*,.pdf,.doc,.docx"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-gray-400 hover:text-white transition"
                                disabled={isUploading}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </button>

                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => {
                                    setInputMessage(e.target.value);
                                    handleTyping();
                                }}
                                onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    !isUploading &&
                                    sendMessage()
                                }
                                placeholder="type here"
                                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                                disabled={!isConnected || isUploading}
                            />

                            <button
                                onClick={() =>
                                    setShowEmojiPicker(!showEmojiPicker)
                                }
                                className="text-gray-400 hover:text-white transition"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-gray-400 hover:text-white transition"
                                disabled={isUploading}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </button>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-2">
                                    <EmojiPicker
                                        onEmojiClick={handleEmojiSelect}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
