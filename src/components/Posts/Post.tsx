"use client";
import {
    FaRegHeart,
    FaRegPaperPlane,
    FaRegComments,
    FaHeart,
} from "react-icons/fa6";
import { useState, useEffect } from "react";
import Comment from "@/components/Posts/PostComment";
import { CommentProps, PostProps } from "@/lib/types";
import MediaCarousel from "@/components/Posts/PostCarousel";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "../BaseText/BaseText";

export default function Post(props: { post: PostProps; user_id: string; userProfilePicture?: string | null }) {
    const { post, user_id, userProfilePicture } = props;
    const effectiveUserId = user_id;
    //const effectiveUserId='55555555-5555-5555-5555-555555555555';

    const [showComments, setShowComments] = useState<boolean>(false);
    const [liked, setLiked] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(0);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(post.comments || []);

    // Sync state with props on every poll update
    useEffect(() => {
        const likes = post.likes || [];
        setLiked(likes.some((like) => like.user_id === effectiveUserId));
        setLikeCount(likes.length);
        setComments(post.comments || []);
    }, [post]);

    async function onLike() {
        await fetch("/api/like/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: effectiveUserId,
                post_id: post.post_id,
            }),
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);
    }

    async function onDislike() {
        await fetch("/api/like/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: effectiveUserId,
                post_id: post.post_id,
            }),
        });
        setLiked(false);
        setLikeCount(prev => prev - 1);
    }

    async function onComment() {
        if (!commentText.trim()) return;

        const res = await fetch("/api/posts/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: effectiveUserId,
                content: commentText,
                post_id: post.post_id,
            }),
        });

        const comment = await res.json();
        console.log(comment);
        setComments([...comments, comment]);
        setCommentText("");
    }

    return (
        <div className="post rounded-xl bg-white w-[80%] mb-10 shadow-lg" id="me">
            <div className="post-header flex items-center p-5">
                <img
                    src={
                        post.artist.profile_picture_url
                            ? getImageUrl(post.artist.profile_picture_url)
                            : getImageUrl(DEFAULT_PROFILE_IMAGE)
                    }
                    alt={`Avatar`}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                    width={100}
                    height={100}
                />
                <BaseText wrapper="span" fontWeight={700} fontName="inter">
                    {post.artist.artist_name}
                </BaseText>
            </div>

            <div className="post-body mb-2">
                {post.media_urls && post.media_urls.length > 0 && (
                    <MediaCarousel mediaUrls={post.media_urls} />
                )}
                {!post.media_urls || post.media_urls.length === 0 ? (
                    post.content_text && (
                        <div className="p-5">
                            <BaseText fontSize="small">
                                {post.content_text}
                            </BaseText>
                        </div>
                    )
                ) : null}
            </div>
            <div className="post-interactions flex pl-4 py-5 text-lg">
                <button className="flex items-center mr-4">
                    {!liked ? (
                        <FaRegHeart
                            className="mr-3 cursor-pointer"
                            onClick={() => onLike()}
                        />
                    ) : (
                        <FaHeart
                            className="mr-3 cursor-pointer fill-rose-400"
                            onClick={() => onDislike()}
                        />
                    )}
                    <BaseText
                        wrapper="span"
                        fontName="inter"
                        fontSize="small"
                        fontWeight={500}
                    >
                        Like {likeCount > 0 && `(${likeCount})`}
                    </BaseText>
                </button>
                <button
                    className="flex items-center mr-4 cursor-pointer"
                    onClick={() => setShowComments(!showComments)}
                >
                    <FaRegComments className="mr-3" />
                    <BaseText
                        wrapper="span"
                        fontName="inter"
                        fontSize="small"
                        fontWeight={500}
                    >
                        Comment
                    </BaseText>
                </button>
                <button className="flex items-center mr-4">
                    <FaRegPaperPlane className="mr-3" />
                    <BaseText
                        wrapper="span"
                        fontName="inter"
                        fontSize="small"
                        fontWeight={500}
                    >
                        Share
                    </BaseText>
                </button>
            </div>
            {post.media_urls && post.media_urls.length > 0 && post.content_text && (
                <div className="post-details flex px-5 pb-5 flex-wrap">
                    <BaseText
                        fontWeight={400}
                        fontName="arial"
                        fontSize="small"
                        textColor="#191919"
                    >
                        <BaseText
                            className="mr-3"
                            wrapper="span"
                            fontWeight={700}
                            fontSize="normal"
                        >
                            {post.artist.artist_name}
                        </BaseText>
                        {post.content_text}
                    </BaseText>
                </div>
            )}
            <div className="post-comments-preview p-4">
                {showComments ? (
                    <div className="post-comment flex items-center gap-3 py-2">
                        <img
                            src={userProfilePicture ? getImageUrl(userProfilePicture) : getImageUrl(DEFAULT_PROFILE_IMAGE)}
                            alt={`Avatar`}
                            className="w-10 h-10 rounded-full object-cover"
                            width={100}
                            height={100}
                        />
                        <input
                            placeholder="Write a comment..."
                            className="flex-1 bg-gray-50 text-gray-900 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF4E27] border border-gray-300"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && onComment()
                            }
                        />
                        <button
                            onClick={onComment}
                            className="text-purple-600 font-semibold hover:text-purple-700 transition"
                        >
                            Post
                        </button>
                    </div>
                ) : null}
                {showComments
                    ? comments.map((comment: CommentProps, index: number) => {
                          console.log("Post comments:", comment);
                          return (
                              <Comment
                                  key={index}
                                  comment={comment}
                                  user_id={effectiveUserId}
                                  post_id={post.post_id}
                              />
                          );
                      })
                    : null}
            </div>
        </div>
    );
}
