'use client';
import { FaRegHeart, FaHeart } from 'react-icons/fa6';
import { useState } from 'react';
import Image from 'next/image';
import { CommentProps } from '@/lib/types';
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from '@/utils/userProfileImageUtils';

export default function Comment({
  comment,
  user_id,
  post_id
}: {
  comment: CommentProps;
  user_id: string;
  post_id: string;
}) {
  console.log('Feed PostComment:', comment);
  console.log('User object:', comment.user);
  console.log('Profile picture URL:', comment.user?.profile_picture_url);

  const filtered = comment.likes.filter((like)=>like.user_id==user_id);

  const [liked, setLiked] = useState<boolean>(filtered.length===1);
  const [likeCount, setLikeCount] = useState<number>(comment.likes.length || 0);
  const [replyText, setReplyText] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

      async function onLike(){
        await fetch('/api/like/',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                user_id : user_id,
                comment_id : comment.comment_id
            })
        })
        setLiked(true);
        setLikeCount(likeCount + 1);
      }

      async function onDislike(){
        await fetch('/api/like/',{
            method : 'DELETE',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                user_id : user_id,
                comment_id : comment.comment_id
            })
        })
        setLiked(false);
        setLikeCount(likeCount - 1);
      }

  async function handleReply(){
    if (!replyText.trim()) return;
    console.log(comment.parent_comment_id)
    const res = await fetch('/api/posts/comment',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                user_id : user_id,
                content : replyText,
                post_id : post_id,
                parent_comment_id : comment.comment_id,
            })
    })
    const reply = await res.json()
    setReplies([...replies,reply])
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className="post-comment flex flex-col py-2">
      <div className="flex items-center">
        <img
          src={comment.user?.profile_picture_url ? getImageUrl(comment.user.profile_picture_url) : getImageUrl(DEFAULT_PROFILE_IMAGE)}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover mr-5"
          width={100}
          height={100}
        />
        <div>
          <h1 className="font-semibold">{comment.user?.username || 'Unknown User'}</h1>
          <h1>{comment.content}</h1>
          <div className="flex mt-1">
            <div className="flex items-center mr-4">
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
              <p className="comment-like-count">{likeCount!=0 ? likeCount : null}</p>
            </div>
            <div
              className="flex items-center mr-4 cursor-pointer"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              <p className="font-semibold">Reply</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {showReplyBox && (
        <div className="flex mt-2 ml-16">
            <input 
                placeholder='Write a reply...' 
                className='border-b-black border-b-2 w-[35vw] p-2 focus:outline-none'
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReply()}
            >
            </input>
            <button
                onClick={handleReply}
                className="text-black px-3 py-1 font-semibold text-sm"
            > Reply
            </button>
        </div>
      )}

    {/* Replies */}
    {replies.length > 0 && (
    <div className="ml-16 mt-2">
        {replies.map((reply) => (
        <Comment
            key={reply.comment_id}
            comment={reply}
            user_id={user_id}
            post_id={post_id}
        />
        ))}
    </div>
    )}
    </div>
  );
}