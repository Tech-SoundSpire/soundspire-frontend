'use client';
import { useEffect, useState } from 'react';

interface Comment {
  id: string;
  user: string;
  text: string;
  likes: number;
  replies: Comment[];
}

export default function CommentsSection({ reviewId }: { reviewId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/comments/${reviewId}`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setComments(data.comments || []);
        setLikes(data.likes || 0);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reviewId]);

  const handleLike = async () => {
    setLikes(prev => prev + 1);
    // Optional: send like to backend
  };

  const handleCommentLike = (id: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === id ? { ...comment, likes: comment.likes + 1 } : comment
      )
    );
    // Optional: send like update to backend
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      user: 'You',
      text: newComment.trim(),
      likes: 0,
      replies: [],
    };

    setComments([newCommentObj, ...comments]);
    setNewComment('');

    try {
      await fetch(`/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          text: newCommentObj.text,
        }),
      });
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  return (
    <div className="mt-8 bg-[#231b32] rounded-lg p-6">
      <div className="flex items-center mb-4">
        <button onClick={handleLike} className="text-red-400 font-bold mr-2">
          ♥
        </button>
        <span className="text-white font-semibold mr-4">{likes} Likes</span>
        <span className="text-gray-400">{comments.length} Comments</span>
      </div>

      <div className="mb-4 flex">
        <input
          className="flex-1 rounded-l px-3 py-2 bg-[#2d2838] text-white focus:outline-none"
          placeholder="Add a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          className="bg-purple-600 text-white px-4 py-2 rounded-r"
        >
          Post
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-400">No comments yet. Be the first!</div>
      ) : (
        comments.map(comment => (
          <div key={comment.id} className="mb-4 p-3 bg-[#2d2838] rounded">
            <div className="flex items-center mb-1">
              <span className="text-white font-semibold mr-2">
                {comment.user}
              </span>
              <button
                onClick={() => handleCommentLike(comment.id)}
                className="text-red-400 ml-2"
              >
                ♥ {comment.likes}
              </button>
            </div>
            <div className="text-gray-200 mb-1">{comment.text}</div>
          </div>
        ))
      )}
    </div>
  );
}
