'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';

interface FanArtPost {
  forum_post_id: string;
  title: string;
  content: string;
  media_urls: string[];
  is_pinned: boolean;
  likes_count: number;
  user_has_liked: boolean;
  created_at: string;
  user: {
    user_id: string;
    username: string;
    full_name: string;
    profile_picture_url: string;
  };
}

export default function FanArtPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const communityId = params.communityId as string;
  
  const [posts, setPosts] = useState<FanArtPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [forumId, setForumId] = useState<string | null>(null);
  
  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  useEffect(() => {
    if (user) {
      fetchForum();
    }
  }, [user]);
  
  useEffect(() => {
    if (forumId) {
      fetchFanArt();
      subscribeToNewPosts();
    }
  }, [forumId]);
  
  const fetchForum = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/forums`);
      if (res.ok) {
        const data = await res.json();
        const fanArtForum = data.forums.find((f: any) => f.forum_type === 'fan_art');
        if (fanArtForum) {
          setForumId(fanArtForum.forum_id);
        } else {
          toast.error('Fan art forum not found');
        }
      }
    } catch (error) {
      console.error('Error fetching forum:', error);
      toast.error('Failed to load forum');
    }
  };
  
  const fetchFanArt = async () => {
    if (!forumId) return;
    
    try {
      const res = await fetch(`/api/forums/${forumId}/fan-art?limit=20`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching fan art:', error);
      toast.error('Failed to load fan art');
    } finally {
      setLoading(false);
    }
  };
  
  const subscribeToNewPosts = () => {
    if (!forumId || !user) return;
    
    // Subscribe to new fan art posts (optional for real-time updates)
    const channel = supabase
      .channel(`fan-art:${forumId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
          filter: `forum_id=eq.${forumId}`
        },
        async (payload: any) => {
          // Only handle image posts
          if (payload.new.media_type === 'image') {
            // Fetch user details
            const { data: userData } = await supabase
              .from('users')
              .select('user_id, username, full_name, profile_picture_url')
              .eq('user_id', payload.new.user_id)
              .single();
            
            const newPost: FanArtPost = {
              ...payload.new,
              user: userData,
              likes_count: 0,
              user_has_liked: false
            };
            
            setPosts(prev => [newPost, ...prev]);
            toast.success('New fan art posted!');
          }
        }
      )
      .subscribe();
    
    return () => channel.unsubscribe();
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Only jpg, jpeg, png, gif, webp files allowed');
      return;
    }
    
    // Validate file size (max 10MB per file)
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Files must be under 10MB');
      return;
    }
    
    setSelectedFiles(files);
    
    // Generate preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    
    if (!forumId) {
      toast.error('Forum not found');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload each file to S3
      const uploadedUrls: string[] = [];
      
      for (const file of selectedFiles) {
        // 1. Get presigned URL
        const fileName = `fan-art/${communityId}/${Date.now()}-${file.name}`;
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileName, 
            fileType: file.type 
          })
        });
        
        if (!uploadRes.ok) {
          throw new Error('Failed to get upload URL');
        }
        
        const { uploadUrl, key } = await uploadRes.json();
        
        // 2. Upload to S3
        const s3Res = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });
        
        if (!s3Res.ok) {
          throw new Error('Failed to upload to S3');
        }
        
        // 3. Construct public URL
        const publicUrl = `https://soundspirewebsiteassets.s3.ap-south-1.amazonaws.com/${key}`;
        uploadedUrls.push(publicUrl);
      }
      
      // 4. Create fan art post
      const createRes = await fetch(`/api/forums/${forumId}/fan-art`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: description,
          imageUrls: uploadedUrls
        })
      });
      
      if (!createRes.ok) {
        throw new Error('Failed to create post');
      }
      
      const { post } = await createRes.json();
      
      // Add to posts list
      setPosts(prev => [post, ...prev]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFiles([]);
      setPreviewUrls([]);
      setShowUploadModal(false);
      
      toast.success('Fan art uploaded successfully!');
    } catch (error) {
      console.error('Error uploading fan art:', error);
      toast.error('Failed to upload fan art');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/forum-posts/${postId}/like`, {
        method: 'POST'
      });
      
      if (res.ok) {
        const { liked } = await res.json();
        
        // Update post in state
        setPosts(prev => prev.map(post => {
          if (post.forum_post_id === postId) {
            return {
              ...post,
              user_has_liked: liked,
              likes_count: liked ? post.likes_count + 1 : post.likes_count - 1
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like post');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1625]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading fan art...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#1a1625] pb-20">
      {/* Header */}
      <div className="bg-[#2d2838] p-6 sticky top-0 z-10 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">Fan Art Gallery</h1>
            <p className="text-gray-400 text-sm mt-1">
              Share your artwork with the community
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/artist/dashboard`)}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-[#FA6400] text-white rounded-lg font-semibold hover:bg-[#e55a00] transition"
            >
              + Upload Art
            </button>
          </div>
        </div>
      </div>
      
      {/* Fan Art Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No fan art yet</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-[#FA6400] text-white rounded-lg font-semibold hover:bg-[#e55a00] transition"
            >
              Be the first to upload!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.forum_post_id}
                className="bg-[#2d2838] rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-900">
                  <img
                    src={post.media_urls[0]}
                    alt={post.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(post.media_urls[0], '_blank')}
                  />
                  {post.is_pinned && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ FEATURED
                    </div>
                  )}
                  {post.media_urls.length > 1 && (
                    <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      +{post.media_urls.length - 1} more
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2">
                    {post.title}
                  </h3>
                  {post.content && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {post.content}
                    </p>
                  )}
                  
                  {/* User Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={post.user.profile_picture_url || '/images/placeholder.jpg'}
                      alt={post.user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {post.user.full_name || post.user.username}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => handleLike(post.forum_post_id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition"
                    >
                      {post.user_has_liked ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                      <span className="text-sm font-semibold">
                        {post.likes_count}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d2838] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold">Upload Fan Art</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-white transition"
                  disabled={isUploading}
                >
                  <FaTimes size={24} />
                </button>
              </div>
              
              {/* File Input */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Select Images
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full px-4 py-3 bg-[#1a1625] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isUploading}
                />
                <p className="text-gray-500 text-sm mt-2">
                  Supported: JPG, JPEG, PNG, GIF, WEBP (Max 10MB each)
                </p>
              </div>
              
              {/* Preview */}
              {previewUrls.length > 0 && (
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Preview
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {previewUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Title */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your artwork a title"
                  className="w-full px-4 py-3 bg-[#1a1625] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isUploading}
                />
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your artwork..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#1a1625] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  disabled={isUploading}
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="flex-1 px-6 py-3 bg-[#FA6400] text-white rounded-lg font-semibold hover:bg-[#e55a00] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
