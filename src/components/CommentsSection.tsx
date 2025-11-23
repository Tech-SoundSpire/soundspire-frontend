import { useState, useEffect, useRef } from "react";
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
    // Use ref to track pending requests for immediate checks (before state updates)
    const pendingLikesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        fetch(`/api/reviews/${reviewId}/comments`)
            .then((res) => res.json())
            .then(async (commentsResponse) => {
                const commentsArray: Comment[] = Array.isArray(commentsResponse)
                    ? commentsResponse
                    : [];
                const likedIds: string[] = [];

                const withLikes = await Promise.all(
                    commentsArray.map(async (c: Comment) => {
                        const likes = c.comment_id
                            ? await fetchCommentLikeCount(c.comment_id)
                            : 0;
                        const liked =
                            c.comment_id && userId
                                ? await fetchCommentLikeStatus(
                                      c.comment_id,
                                      userId
                                  )
                                : false;

                        if (liked && c.comment_id) {
                            likedIds.push(c.comment_id);
                        }

                        return {
                            ...c,
                            likes,
                        };
                    })
                );

                setComments(withLikes);
                setLikedComments(new Set(likedIds));
            })
            .catch((error) => {
                console.error("Error fetching comments:", error);
                setComments([]);
                setLikedComments(new Set());
            });
    }, [reviewId, userId]);

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

            const comment = await res.json();
            const likes = comment.comment_id
                ? await fetchCommentLikeCount(comment.comment_id)
                : 0;
            setComments([{ ...comment, replies: [], likes }, ...comments]);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReply = async (parentId: string, replyText: string) => {
        if (!replyText.trim() || !parentId) return;
        try {
            const res = await fetch(`/api/comments/${parentId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, content: replyText }),
            });
            if (!res.ok) throw new Error("Failed to add reply");

            const reply = await res.json();
            setComments((comments) =>
                comments.map((c) =>
                    c.comment_id === parentId
                        ? {
                              ...c,
                              replies: [
                                  ...(c.replies || []),
                                  { ...reply, replies: [], likes: 0 },
                              ],
                          }
                        : c
                )
            );
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
            <div className="mb-4 flex">
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
                            {comment.content}
                        </div>
                        <RepliesSection
                            parentId={comment.comment_id}
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
    replies,
    onAddReply,
}: {
    parentId: string;
    replies: Comment[];
    onAddReply: (parentId: string, replyText: string) => void;
}) {
    const [replyText, setReplyText] = useState("");
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
                        {reply.content}
                    </BaseText>
                </div>
            ))}
            <div className="flex mt-1">
                <input
                    className="flex-1 rounded-l px-2 py-1 bg-[#2d2838] text-white focus:outline-none text-sm"
                    placeholder="Reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === "Enter" &&
                        onAddReply(parentId, replyText) &&
                        setReplyText("")
                    }
                />
                <button
                    onClick={() => {
                        onAddReply(parentId, replyText);
                        setReplyText("");
                    }}
                    className="bg-purple-600 text-white px-2 py-1 rounded-r text-sm"
                >
                    Reply
                </button>
            </div>
        </div>
    );
}
