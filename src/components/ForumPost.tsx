"use client";
import { FaRegHeart, FaRegPaperPlane, FaRegComments, FaHeart } from "react-icons/fa6";
import { useState, useEffect } from "react";
import Comment from "@/components/Posts/PostComment";
import { CommentProps, PostProps } from "@/lib/types";
import MediaCarousel from "@/components/Posts/PostCarousel";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";

export default function ForumPost(props: { post: PostProps; user_id: string; userProfilePicture?: string | null }) {
    const { post, user_id, userProfilePicture } = props;

    const [showComments, setShowComments] = useState<boolean>(false);
    const [liked, setLiked] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(0);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(post.comments || []);

    // Sync state with props on every poll update
    useEffect(() => {
        const likes = post.likes || [];
        setLiked(likes.some((like) => like.user_id === user_id));
        setLikeCount(likes.length);
        setComments(post.comments || []);
    }, [post]);

    async function onLike() {
        await fetch("/api/like/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, post_id: post.post_id }),
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);
    }

    async function onDislike() {
        await fetch("/api/like/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, post_id: post.post_id }),
        });
        setLiked(false);
        setLikeCount(prev => prev - 1);
    }

    async function onComment() {
        if (!commentText.trim()) return;

        const res = await fetch("/api/posts/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, content: commentText, post_id: post.post_id }),
        });

        const comment = await res.json();
        setComments([...comments, comment]);
        setCommentText("");
    }

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Post Header */}
            <div className="flex items-center p-4 border-b border-gray-200">
                <img
                    src={post.artist.profile_picture_url ? getImageUrl(post.artist.profile_picture_url) : getImageUrl(DEFAULT_PROFILE_IMAGE)}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover mr-3"
                />
                <span className="text-gray-900 font-semibold text-lg">{post.artist.artist_name}</span>
            </div>

            {/* Post Media */}
            {post.media_urls && post.media_urls.length > 0 && (
                <div className="bg-black">
                    <MediaCarousel mediaUrls={post.media_urls} />
                </div>
            )}

            {/* Post Content */}
            {post.content_text && (
                <div className="p-4">
                    {post.media_urls && post.media_urls.length > 0 ? (
                        <p className="text-gray-700">
                            <span className="font-semibold text-gray-900 mr-2">{post.artist.artist_name}</span>
                            {post.content_text}
                        </p>
                    ) : (
                        <p className="text-gray-700 text-base">{post.content_text}</p>
                    )}
                </div>
            )}

            {/* Interactions */}
            <div className="flex items-center gap-6 px-4 py-3 border-t border-gray-200">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition" onClick={liked ? onDislike : onLike}>
                    {liked ? <FaHeart className="text-red-500" size={20} /> : <FaRegHeart size={20} />}
                    <span className="text-sm font-medium">Like {likeCount > 0 && `(${likeCount})`}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition" onClick={() => setShowComments(!showComments)}>
                    <FaRegComments size={20} />
                    <span className="text-sm font-medium">Comment {comments.length > 0 && `(${comments.length})`}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                    <FaRegPaperPlane size={20} />
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 text-gray-900">
                    {/* Comment Input */}
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src={userProfilePicture ? getImageUrl(userProfilePicture) : getImageUrl(DEFAULT_PROFILE_IMAGE)}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <input
                            placeholder="Write a comment..."
                            className="flex-1 bg-white text-gray-900 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4E27] border border-gray-300"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onComment()}
                        />
                        <button onClick={onComment} className="text-purple-600 font-semibold hover:text-purple-700 transition">
                            Post
                        </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 text-gray-900">
                        {comments.map((comment: CommentProps, index: number) => (
                            <Comment key={index} comment={comment} user_id={user_id} post_id={post.post_id} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
