import { useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import BaseText from "./BaseText/BaseText";

interface Comment {
    comment_id: string;
    user_id?: string;
    content: string;
    created_at: string;
    replies: Comment[];
    likes: number;
    user?: {
        username: string;
        profile_picture_url?: string;
        full_name?: string;
    };
}

function renderMentions(text: string): ReactNode[] {
    const parts = text.split(/(@[\w\-\.]+)/g);
    return parts.map((part, i) =>
        /^@[\w\-\.]+$/.test(part)
            ? <span key={i} style={{ color: "#FF4E27", fontWeight: 700 }}>{part}</span>
            : part
    );
}

async function fetchCommentLikeCount(comment_id: string): Promise<number> {
    if (!comment_id || comment_id === "undefined") return 0;
    try {
        const res = await fetch(`/api/comments/${comment_id}/like/count`);
        if (!res.ok) return 0;
        const data = await res.json();
        return data.count || 0;
    } catch (error) {
        console.error("Error fetching like count:", error);
        return 0;
    }
}

async function fetchCommentLikeStatus(
    comment_id: string,
    userId: string
): Promise<boolean> {
    if (!comment_id || comment_id === "undefined") return false;
    try {
        const res = await fetch(
            `/api/comments/${comment_id}/like/status?user_id=${userId}`
        );
        if (!res.ok) return false;
        const data = await res.json();
        return data.liked || false;
    } catch (error) {
        console.error("Error fetching like status:", error);
        return false;
    }
}

export default function CommentsSection({
    reviewId,
    userId,
}: {
    reviewId: string;
    userId: string;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
    const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());
    const pendingLikesRef = useRef<Set<string>>(new Set());

    const fetchComments = useRef<() => Promise<void>>();
    
    const doFetchComments = async () => {
        try {
            const res = await fetch(`/api/reviews/${reviewId}/comments`);
            const commentsResponse = await res.json();
            const commentsArray: Comment[] = Array.isArray(commentsResponse)
                ? commentsResponse
                : commentsResponse?.comments || [];

            const likedIds: string[] = [];
            const withLikes = await Promise.all(
                commentsArray.map(async (c: Comment) => {
                    const likes = c.comment_id ? await fetchCommentLikeCount(c.comment_id) : 0;
                    const liked = c.comment_id && userId ? await fetchCommentLikeStatus(c.comment_id, userId) : false;
                    if (liked && c.comment_id) likedIds.push(c.comment_id);
                    return { ...c, likes };
                })
            );
            setComments(withLikes);
            setLikedComments(new Set(likedIds));
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    fetchComments.current = doFetchComments;

    useEffect(() => { doFetchComments(); }, [reviewId, userId]);

    // Realtime: refetch on any comment or like change for this review
    useEffect(() => {
        const channel = supabase
            .channel(`review-comments:${reviewId}`)
            .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `review_id=eq.${reviewId}` }, () => { fetchComments.current?.(); })
            .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, () => { fetchComments.current?.(); })
            .subscribe();
        return () => { channel.unsubscribe(); };
    }, [reviewId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews/${reviewId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, content: newComment }),
            });
            if (!res.ok) throw new Error("Failed to add comment");
            setNewComment("");
            await doFetchComments();
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReply = async (parentId: string, replyText: string, parentUsername?: string) => {
        if (!replyText.trim() || !parentId) return;
        const mentionPrefix = parentUsername ? `@${parentUsername} ` : "";
        const content = mentionPrefix + replyText;
        try {
            const res = await fetch(`/api/comments/${parentId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, content }),
            });
            if (!res.ok) throw new Error("Failed to add reply");

            const reply = await res.json();
            await doFetchComments();
        } catch (error) {
            console.error("Error adding reply:", error);
        }
    };

    const handleToggleCommentLike = async (commentId: string) => {
        // Early return if invalid commentId
        if (!commentId || commentId === "undefined") return;

        const currentlyLiked = likedComments.has(commentId);

        // Prevent if request is already in progress (check both ref and state)
        if (
            pendingLikesRef.current.has(commentId) ||
            pendingLikes.has(commentId)
        )
            return;

        // Mark as pending immediately in both ref and state
        pendingLikesRef.current.add(commentId);
        setPendingLikes((prev) => new Set(prev).add(commentId));

        try {
            const method = currentlyLiked ? "DELETE" : "POST";

            const res = await fetch(`/api/comments/${commentId}/like`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData?.error || "Failed to toggle comment like"
                );
            }

            const data = await res.json();

            setLikedComments((prev) => {
                const next = new Set(prev);
                if (data.liked ?? !currentlyLiked) {
                    next.add(commentId);
                } else {
                    next.delete(commentId);
                }
                return next;
            });

            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.comment_id === commentId
                        ? {
                              ...comment,
                              likes:
                                  typeof data.count === "number"
                                      ? data.count
                                      : currentlyLiked
                                      ? Math.max(0, (comment.likes || 0) - 1)
                                      : (comment.likes || 0) + 1,
                          }
                        : comment
                )
            );
        } catch (error) {
            console.error("Error toggling comment like:", error);
        } finally {
            // Remove from pending after a delay to prevent rapid clicking
            setTimeout(() => {
                pendingLikesRef.current.delete(commentId);
                setPendingLikes((prev) => {
                    const next = new Set(prev);
                    next.delete(commentId);
                    return next;
                });
            }, 1000); // 1 second delay
        }
    };

    return (
        <div className="mt-8 bg-[#231b32] rounded-lg p-6">
            <div className="mb-4 flex items-center">
                <input
                    className="flex-1 rounded-l px-3 py-2 bg-[#2d2838] text-white focus:outline-none"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    disabled={loading}
                />
                <button
                    onClick={handleAddComment}
                    className="bg-purple-600 text-white px-4 py-2 rounded-r"
                    disabled={loading}
                >
                    Post
                </button>
            </div>
            {comments.map((comment) => {
                const isLiked = likedComments.has(comment.comment_id);
                const isPending = pendingLikes.has(comment.comment_id);
                const isDisabled = isPending;

                return (
                    <div
                        key={comment.comment_id || Math.random()}
                        className="mb-4 p-3 bg-[#2d2838] rounded"
                    >
                        <div className="flex items-center mb-1">
                            <BaseText
                                textColor="#ffffff"
                                fontWeight={600}
                                fontName="inter"
                                wrapper="span"
                                className="mr-2"
                            >
                                {comment.user?.username || "Unknown User"}
                            </BaseText>
                            <button
                                onClick={() =>
                                    handleToggleCommentLike(comment.comment_id)
                                }
                                disabled={isDisabled}
                                className={`ml-2 transition-colors duration-200 ${
                                    isPending
                                        ? "text-gray-400 cursor-not-allowed opacity-50"
                                        : isLiked
                                        ? "text-red-400 hover:text-red-300 cursor-pointer"
                                        : "text-gray-400 hover:text-gray-300 cursor-pointer"
                                }`}
                                aria-pressed={isLiked}
                            >
                                ♥ {comment.likes || 0}
                            </button>
                        </div>
                        <div className="text-gray-200 mb-1">
                            {renderMentions(comment.content)}
                        </div>
                        <RepliesSection
                            parentId={comment.comment_id}
                            parentUsername={comment.user?.username || "user"}
                            replies={comment.replies || []}
                            onAddReply={handleAddReply}
                        />
                    </div>
                );
            })}
        </div>
    );
}

function RepliesSection({
    parentId,
    parentUsername,
    replies,
    onAddReply,
}: {
    parentId: string;
    parentUsername: string;
    replies: Comment[];
    onAddReply: (parentId: string, replyText: string, parentUsername?: string) => void;
}) {
    const [replyText, setReplyText] = useState("");

    const handleSubmit = () => {
        if (!replyText.trim()) return;
        onAddReply(parentId, replyText, parentUsername);
        setReplyText("");
    };

    return (
        <div className="ml-6 mt-2">
            {replies.map((reply) => (
                <div
                    key={reply.comment_id || Math.random()}
                    className="mb-2 p-2 bg-[#231b32] rounded"
                >
                    <BaseText
                        wrapper="span"
                        fontName="inter"
                        textColor="#ffffff"
                        fontWeight={600}
                        className="mr-2"
                    >
                        {reply.user?.username || "Unknown User"}
                    </BaseText>
                    <BaseText textColor="#e5e7eb" wrapper="span">
                        {renderMentions(reply.content)}
                    </BaseText>
                </div>
            ))}
            <div className="flex items-center mt-1">
                <span className="text-[#FF4E27] font-bold text-sm mr-1 flex-shrink-0">@{parentUsername}</span>
                <input
                    className="flex-1 rounded-l px-2 py-1 bg-[#2d2838] text-white focus:outline-none text-sm"
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white px-2 py-1 rounded-r text-sm"
                >
                    Reply
                </button>
            </div>
        </div>
    );
}
