"use client";
import { FaRegHeart, FaHeart } from "react-icons/fa6";
import { useState, useEffect, ReactNode } from "react";
import { CommentProps } from "@/lib/types";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "../BaseText/BaseText";

const MAX_DEPTH = 2;
const TRUNCATE_LENGTH = 200;

function renderMentions(text: string): ReactNode[] {
    const parts = text.split(/(@[\w\-\.]+)/g);
    return parts.map((part, i) =>
        /^@[\w\-\.]+$/.test(part)
            ? <span key={i} style={{ color: "#FF4E27", fontWeight: 700 }}>{part}</span>
            : part
    );
}

export default function Comment({
    comment,
    user_id,
    post_id,
    depth = 0,
}: {
    comment: CommentProps;
    user_id: string;
    post_id: string;
    depth?: number;
}) {
    const [liked, setLiked] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(0);
    const [replyText, setReplyText] = useState("");
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replies, setReplies] = useState(comment.replies || []);
    const [collapsed, setCollapsed] = useState(replies.length > 0);
    const [expanded, setExpanded] = useState(false);
    const [mentionPrefix, setMentionPrefix] = useState("");

    useEffect(() => {
        const likes = comment.likes || [];
        setLiked(likes.some((like) => like.user_id === user_id));
        setLikeCount(likes.length);
        setReplies(comment.replies || []);
    }, [comment, user_id]);

    async function onLike() {
        await fetch("/api/like/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, comment_id: comment.comment_id }),
        });
        setLiked(true);
        setLikeCount((prev) => prev + 1);
    }

    async function onDislike() {
        await fetch("/api/like/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id, comment_id: comment.comment_id }),
        });
        setLiked(false);
        setLikeCount((prev) => prev - 1);
    }

    function openReply() {
        const username = comment.user?.username || "user";
        setMentionPrefix(`@${username}`);
        setReplyText("");
        setShowReplyBox(true);
    }

    function cancelReply() {
        setShowReplyBox(false);
        setReplyText("");
        setMentionPrefix("");
    }

    async function handleReply() {
        if (!replyText.trim()) return;
        const content = mentionPrefix ? `${mentionPrefix} ${replyText}` : replyText;
        const res = await fetch("/api/posts/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id,
                content,
                post_id,
                parent_comment_id: comment.comment_id,
            }),
        });
        const reply = await res.json();
        setReplies([...replies, reply]);
        cancelReply();
    }

    const isLong = comment.content.length > TRUNCATE_LENGTH;
    const displayContent = isLong && !expanded
        ? comment.content.slice(0, TRUNCATE_LENGTH) + "..."
        : comment.content;

    const replyInput = showReplyBox && depth < MAX_DEPTH && (
        <div className="flex items-center gap-2 ml-11 mb-2">
            {mentionPrefix && (
                <span className="text-[#FF4E27] font-bold text-sm flex-shrink-0">{mentionPrefix}</span>
            )}
            <input
                placeholder="Write a reply..."
                className="flex-1 border-b-2 border-gray-600 bg-transparent p-2 focus:outline-none focus:border-purple-500 text-sm"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                autoFocus
            />
            <button onClick={handleReply} className="font-semibold text-sm text-purple-400 hover:text-purple-300">Reply</button>
            <button onClick={cancelReply} className="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
        </div>
    );

    const commentBody = (
        <div className="flex items-start gap-3 py-2">
            <img
                src={comment.user?.profile_picture_url ? getImageUrl(comment.user.profile_picture_url) : getImageUrl(DEFAULT_PROFILE_IMAGE)}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <BaseText wrapper="span" fontWeight={600} fontSize="small">
                    {comment.user?.username || "Unknown User"}
                </BaseText>
                <BaseText fontSize="small" fontName="inter" fontWeight={500}>
                    {renderMentions(displayContent)}
                </BaseText>
                {isLong && (
                    <button onClick={() => setExpanded(!expanded)} className="text-purple-400 hover:text-purple-300 text-xs font-medium mt-0.5">
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}
                <div className="flex items-center gap-3 mt-1">
                    <button className="flex items-center gap-1" onClick={liked ? onDislike : onLike}>
                        {liked ? <FaHeart className="fill-rose-400" size={14} /> : <FaRegHeart size={14} />}
                        {likeCount > 0 && <BaseText fontSize="small">{likeCount}</BaseText>}
                    </button>
                    {depth < MAX_DEPTH && (
                        <button onClick={openReply}>
                            <BaseText fontWeight={600} fontSize="small">Reply</BaseText>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative">
            {depth > 0 && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-px bg-gray-600 hover:bg-gray-400 cursor-pointer"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? "Expand" : "Collapse"}
                />
            )}
            <div className={depth > 0 ? "pl-5" : ""}>
                {collapsed ? (
                    <>
                        {commentBody}
                        {replyInput}
                        {replies.length > 0 && (
                            <button onClick={() => setCollapsed(false)} className="text-xs text-purple-400 hover:text-purple-300 ml-11">
                                [+] {replies.length} {replies.length === 1 ? "reply" : "replies"}
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        {commentBody}
                        {replyInput}
                        {replies.length > 0 && (
                            <>
                                <button onClick={() => setCollapsed(true)} className="text-xs text-gray-500 hover:text-gray-300 ml-11">
                                    [−] Collapse {replies.length} {replies.length === 1 ? "reply" : "replies"}
                                </button>
                                <div className="mt-1">
                                    {replies.map((reply) => (
                                        <Comment key={reply.comment_id} comment={reply} user_id={user_id} post_id={post_id} depth={Math.min(depth + 1, MAX_DEPTH)} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
