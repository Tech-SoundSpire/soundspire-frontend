"use client";
import {
    FaRegHeart,
    FaRegPaperPlane,
    FaRegComments,
    FaHeart,
} from "react-icons/fa6";
import { useState } from "react";
import Comment from "@/components/Posts/PostComment";
import Image from "next/image";
import { CommentProps, PostProps } from "@/lib/types";
import MediaCarousel from "@/components/Posts/PostCarousel";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "../BaseText/BaseText";

export default function Post(props: { post: PostProps; user_id: string }) {
    const { post, user_id } = props;
    const effectiveUserId = user_id;
    //const effectiveUserId='55555555-5555-5555-5555-555555555555';

    const filtered = post.likes.filter(
        (like) => like.user_id == effectiveUserId
    );

    const [showComments, setShowComments] = useState<boolean>(false);
    const [liked, setLiked] = useState<boolean>(filtered.length == 1);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState(post.comments);
    console.log("Post data:", post);
    console.log("Comments array:", comments);

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
        <div className="post rounded-xl bg-white w-[80%] mb-10">
            <div className="post-header flex items-center p-5">
                <Image
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
                {post.media_type == "image" ? (
                    <MediaCarousel mediaUrls={post.media_urls} />
                ) : null}
                {post.media_type == "none" ? (
                    <div className="p-5">
                        <BaseText fontSize="small">
                            {post.content_text}
                        </BaseText>
                    </div>
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
                        Like
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
            {post.media_type != "none" ? (
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
            ) : null}
            <div className="post-comments-preview p-4">
                {showComments ? (
                    <div className="post-comment flex items-center py-2">
                        <Image
                            src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                            alt={`Avatar`}
                            className="w-12 h-12 rounded-full object-cover mr-5"
                            width={100}
                            height={100}
                        />
                        <div>
                            <input
                                placeholder="Enter Comment..."
                                className="border-b-black border-b-2 w-[35vw] p-2 focus:outline-none"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && onComment()
                                }
                            ></input>
                            <button
                                onClick={onComment}
                                className="text-black px-3 font-semibold text-md"
                            >
                                {" "}
                                Post
                            </button>
                        </div>
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
            {post.media_type != "none" ? (
                <div className="post-details flex px-5 pb-5 flex-wrap">
                    <p>
                        <span className="font-bold mr-3">
                            {post.artist.artist_name}
                        </span>
                        {post.content_text}
                    </p>
                </div>
            ) : null}
            <div className="post-comments-preview p-4">
                {showComments ? (
                    <div className="post-comment flex items-center py-2">
                        <Image
                            src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                            alt={`Avatar`}
                            className="w-12 h-12 rounded-full object-cover mr-5"
                            width={100}
                            height={100}
                        />
                        <div>
                            <input
                                placeholder="Enter Comment..."
                                className="border-b-black border-b-2 w-[35vw] p-2 focus:outline-none"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && onComment()
                                }
                            ></input>
                            <button
                                onClick={onComment}
                                className="text-black px-3 font-semibold text-md"
                            >
                                {" "}
                                Post
                            </button>
                        </div>
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
