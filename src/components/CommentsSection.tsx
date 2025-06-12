import { useState } from 'react';

interface Comment {
  id: string;
  user: string;
  text: string;
  likes: number;
  replies: Comment[];
}

export default function CommentsSection({ comments: initialComments, likes: initialLikes }: { comments: Comment[], likes: number }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [likes, setLikes] = useState(initialLikes);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => setLikes(likes + 1);

  const handleCommentLike = (id: string) => {
    setComments(comments => comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([{ id: Date.now().toString(), user: 'You', text: newComment, likes: 0, replies: [] }, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div className="mt-8 bg-[#231b32] rounded-lg p-6">
      <div className="flex items-center mb-4">
        <button onClick={handleLike} className="text-red-400 font-bold mr-2">♥</button>
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
        <button onClick={handleAddComment} className="bg-purple-600 text-white px-4 py-2 rounded-r">Post</button>
      </div>
      <div>
        {comments.map(comment => (
          <div key={comment.id} className="mb-4 p-3 bg-[#2d2838] rounded">
            <div className="flex items-center mb-1">
              <span className="text-white font-semibold mr-2">{comment.user}</span>
              <button onClick={() => handleCommentLike(comment.id)} className="text-red-400 ml-2">♥ {comment.likes}</button>
            </div>
            <div className="text-gray-200 mb-1">{comment.text}</div>
            {/* Replies can be rendered here if needed */}
          </div>
        ))}
      </div>
    </div>
  );
} 