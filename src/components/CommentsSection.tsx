import { useState, useEffect } from 'react';

interface Comment {
  comment_id: string;
  user_id?: string;
  content: string;
  created_at: string;
  replies: Comment[];
  likes: number;
}

async function fetchCommentLikeCount(comment_id: string): Promise<number> {
  const res = await fetch(`/api/comments/${comment_id}/like/count`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count || 0;
}

export default function CommentsSection({ reviewId, userId }: { reviewId: string, userId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews/${reviewId}/comments`)
      .then(res => res.json())
      .then(async (comments) => {
        // Fetch like counts for each comment
        const withLikes = await Promise.all(comments.map(async (c: Comment) => ({
          ...c,
          likes: await fetchCommentLikeCount(c.comment_id),
        })));
        setComments(withLikes);
      });
  }, [reviewId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/reviews/${reviewId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, content: newComment }),
    });
    const comment = await res.json();
    const likes = await fetchCommentLikeCount(comment.comment_id);
    setComments([{ ...comment, replies: [], likes }, ...comments]);
    setNewComment('');
    setLoading(false);
  };

  const handleAddReply = async (parentId: string, replyText: string) => {
    if (!replyText.trim()) return;
    const res = await fetch(`/api/comments/${parentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, content: replyText }),
    });
    const reply = await res.json();
    setComments(comments => comments.map(c =>
      c.comment_id === parentId ? { ...c, replies: [...(c.replies || []), { ...reply, replies: [], likes: 0 }] } : c
    ));
  };

  

  const handleLikeComment = async (commentId: string) => {
  const res = await fetch(`/api/comments/${commentId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  const data = await res.json();

  if (data.liked) {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.comment_id === commentId
          ? { ...comment, likes: data.count } // update `likes` prop here!
          : comment
      )
    );
  }
};






  return (
    <div className="mt-8 bg-[#231b32] rounded-lg p-6">
      <div className="mb-4 flex">
        <input
          className="flex-1 rounded-l px-3 py-2 bg-[#2d2838] text-white focus:outline-none"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
          disabled={loading}
        />
        <button onClick={handleAddComment} className="bg-purple-600 text-white px-4 py-2 rounded-r" disabled={loading}>Post</button>
      </div>
      {comments.map(comment => (
        <div key={comment.comment_id || Math.random()} className="mb-4 p-3 bg-[#2d2838] rounded">
          <div className="flex items-center mb-1">
            <span className="text-white font-semibold mr-2">User {comment.user_id ? comment.user_id.slice(0, 6) : 'Unknown'}</span>
            <button onClick={() => handleLikeComment(comment.comment_id)} className="text-red-400 ml-2">♥ {comment.likes || 0}</button>
          </div>
          <div className="text-gray-200 mb-1">{comment.content}</div>
          <RepliesSection parentId={comment.comment_id} replies={comment.replies || []} onAddReply={handleAddReply} />
        </div>
      ))}
    </div>
  );
}

function RepliesSection({ parentId, replies, onAddReply }: { parentId: string, replies: Comment[], onAddReply: (parentId: string, replyText: string) => void }) {
  const [replyText, setReplyText] = useState('');
  return (
    <div className="ml-6 mt-2">
      {replies.map(reply => (
        <div key={reply.comment_id || Math.random()} className="mb-2 p-2 bg-[#231b32] rounded">
          <span className="text-white font-semibold mr-2">User {reply.user_id ? reply.user_id.slice(0, 6) : 'Unknown'}</span>
          <span className="text-gray-200">{reply.content}</span>
        </div>
      ))}
      <div className="flex mt-1">
        <input
          className="flex-1 rounded-l px-2 py-1 bg-[#2d2838] text-white focus:outline-none text-sm"
          placeholder="Reply..."
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAddReply(parentId, replyText) && setReplyText('')}
        />
        <button onClick={() => { onAddReply(parentId, replyText); setReplyText(''); }} className="bg-purple-600 text-white px-2 py-1 rounded-r text-sm">Reply</button>
      </div>
    </div>
  );
} 