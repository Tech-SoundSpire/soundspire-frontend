'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaTimes } from 'react-icons/fa';
import { getImageUrl } from '@/utils/userProfileImageUtils';
import { supabase } from '@/lib/supabaseClient';
import { useCommunityPresence } from '@/hooks/useCommunityPresence';
import CommunityHeader from '@/components/CommunityHeader';
import Navbar from '@/components/Navbar';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface Comment {
  forum_post_id: string;
  parent_post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  reactions?: { [emoji: string]: string[] };
  user?: {
    user_id: string;
    username: string;
    full_name: string;
    profile_picture_url: string;
  };
  replies?: Comment[];
}

interface FanArtPost {
  forum_post_id: string;
  title: string;
  content: string;
  media_urls: string[];
  is_pinned: boolean;
  likes_count: number;
  user_has_liked: boolean;
  created_at: string;
  reactions?: { [emoji: string]: string[] };
  comments?: Comment[];
  commentCount?: number;
  user: {
    user_id: string;
    username: string;
    full_name: string;
    profile_picture_url: string;
  };
}

interface CommunityData {
  artist_name: string;
  community_name: string;
  profile_picture_url: string;
  subscriber_count: number;
  online_count: number;
  socials: Array<{ platform: string; url: string }>;
}

export default function FanArtPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [posts, setPosts] = useState<FanArtPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [forumId, setForumId] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [isArtist, setIsArtist] = useState(false);
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  
  const { onlineUsers, onlineUserDetails, onlineCount } = useCommunityPresence(communityId);
  
  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; parentPostId: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (user && slug) {
      fetchCommunityAndForum();
    }
  }, [user, slug]);
  
  useEffect(() => {
    if (forumId) {
      fetchFanArt();
      subscribeToNewPosts();
    }
  }, [forumId]);
  
  const fetchCommunityAndForum = async () => {
    try {
      // slug could be either the actual slug OR a UUID (community_id)
      // Try fetching as slug first
      const artistRes = await fetch(`/api/community/${slug}`);
      
      let commId: string | null = null;
      let artistData: any = null;
      
      if (artistRes.ok) {
        // Parse JSON once and store it
        artistData = await artistRes.json();
        commId = artistData.artist?.community?.community_id;
      } else if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // It's a UUID, use it directly as community_id
        commId = slug;
      }
      
      if (!commId) {
        toast.error('Community not found');
        router.push('/feed');
        return;
      }
      
      setCommunityId(commId);
      
      // Fetch community data for sidebar
      if (artistData) {
        // Fetch subscriber count for this specific community
        const subsRes = await fetch(`/api/communities/${commId}/subscribers`);
        let subscriberCount = 0;
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          subscriberCount = subsData.count || 0;
        } else {
          // Fallback: count from CommunitySubscription table
          const allSubsRes = await fetch(`/api/community/subscribe`);
          if (allSubsRes.ok) {
            const allSubsData = await allSubsRes.json();
            subscriberCount = allSubsData.communities?.filter((c: any) => c.id === commId).length || 0;
          }
        }
        
        // console.log('Community data:', {
        //   artist_name: artistData.artist?.artist_name,
        //   community_name: artistData.artist?.community?.name,
        //   socials: artistData.artist?.socials,
        //   subscriberCount
        // });
        
        setCommunityData({
          artist_name: artistData.artist?.artist_name || 'Community',
          community_name: artistData.artist?.community?.name || artistData.artist?.artist_name || 'Community',
          profile_picture_url: artistData.artist?.profile_picture_url || '',
          subscriber_count: subscriberCount,
          online_count: onlineCount,
          socials: artistData.artist?.socials || []
        });
      }
      
      // Check if current user is the artist
      const artistCheckRes = await fetch(`/api/artist/me`);
      if (artistCheckRes.ok) {
        const artistData = await artistCheckRes.json();
        setIsArtist(user?.role === "artist" && artistData.artist?.community?.community_id === commId);
      }
      
      // Now fetch forums using community_id
      const res = await fetch(`/api/communities/${commId}/forums`);
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
        
        // Fetch comment counts and reactions for each post
        const postsWithCounts = await Promise.all(
          data.posts.map(async (post: FanArtPost) => {
            const { count } = await supabase
              .from('forum_posts')
              .select('*', { count: 'exact', head: true })
              .eq('parent_post_id', post.forum_post_id);
            
            // Fetch reactions from Supabase
            const { data: postData } = await supabase
              .from('forum_posts')
              .select('reactions')
              .eq('forum_post_id', post.forum_post_id)
              .single();
            
            return {
              ...post,
              reactions: postData?.reactions || {},
              comments: [],
              commentCount: count || 0
            };
          })
        );
        
        setPosts(postsWithCounts);
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
    
    // Subscribe to new fan art posts, comments, and reactions
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
          const userRes = await fetch(`/api/users/${payload.new.user_id}`);
          const { user: userData } = userRes.ok ? await userRes.json() : { user: null };
          
          const newPost = {
            ...payload.new,
            user: userData,
            reactions: payload.new.reactions || {},
            replies: []
          };
          
          // If it's a top-level fan art post (image)
          if (payload.new.media_type === 'image' && !payload.new.parent_post_id) {
            setPosts(prev => [{
              ...newPost,
              likes_count: 0,
              user_has_liked: false,
              comments: []
            }, ...prev]);
            toast.success('New fan art posted!');
          }
          // If it's a comment (has parent_post_id)
          else if (payload.new.parent_post_id) {
            setPosts(prev => prev.map(post => {
              // Check if it's a direct comment on the post
              if (post.forum_post_id === payload.new.parent_post_id) {
                // Check if comment already exists (prevent duplicates)
                const exists = post.comments?.some(c => c.forum_post_id === payload.new.forum_post_id);
                if (exists) return post;
                
                return {
                  ...post,
                  comments: [...(post.comments || []), newPost],
                  commentCount: (post.commentCount || 0) + 1
                };
              }
              // Check if it's a reply to a comment
              if (post.comments) {
                return {
                  ...post,
                  comments: post.comments.map(comment => {
                    if (comment.forum_post_id === payload.new.parent_post_id) {
                      // Check if reply already exists (prevent duplicates)
                      const exists = comment.replies?.some(r => r.forum_post_id === payload.new.forum_post_id);
                      if (exists) return comment;
                      
                      return {
                        ...comment,
                        replies: [...(comment.replies || []), newPost]
                      };
                    }
                    return comment;
                  })
                };
              }
              return post;
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forum_posts',
          filter: `forum_id=eq.${forumId}`
        },
        (payload: any) => {
          const updatedReactions = payload.new.reactions || {};
          
          setPosts(prev => prev.map(post => {
            // Update reactions on main post
            if (post.forum_post_id === payload.new.forum_post_id) {
              return { ...post, reactions: updatedReactions };
            }
            // Update reactions on comments or replies
            if (post.comments) {
              return {
                ...post,
                comments: post.comments.map(comment => {
                  if (comment.forum_post_id === payload.new.forum_post_id) {
                    return { ...comment, reactions: updatedReactions };
                  }
                  if (comment.replies) {
                    return {
                      ...comment,
                      replies: comment.replies.map(reply =>
                        reply.forum_post_id === payload.new.forum_post_id
                          ? { ...reply, reactions: updatedReactions }
                          : reply
                      )
                    };
                  }
                  return comment;
                })
              };
            }
            return post;
          }));
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
        
        // 3. Store just the S3 key (not full URL)
        uploadedUrls.push(key);
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
      
      // Don't manually add - Realtime will handle it
      // const { post } = await createRes.json();
      // setPosts(prev => [post, ...prev]);
      
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
  
  const addReaction = async (postId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/forums/${forumId}/messages/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, emoji })
      });
      
      if (!res.ok) throw new Error('Failed to add reaction');
      
      const { reactions } = await res.json();
      
      setPosts(prev => prev.map(post =>
        post.forum_post_id === postId ? { ...post, reactions } : post
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };
  
  const toggleComments = async (postId: string) => {
    const isShown = showComments.has(postId);
    
    if (isShown) {
      setShowComments(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    } else {
      // Fetch comments from Supabase (forum_posts with parent_post_id)
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('parent_post_id', postId)
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        const commentsWithUsers = await Promise.all(
          data.map(async (comment) => {
            const userRes = await fetch(`/api/users/${comment.user_id}`);
            const { user: userData } = userRes.ok ? await userRes.json() : { user: null };
            
            // Fetch replies (nested forum_posts)
            const { data: replies } = await supabase
              .from('forum_posts')
              .select('*')
              .eq('parent_post_id', comment.forum_post_id)
              .order('created_at', { ascending: true });
            
            const repliesWithUsers = await Promise.all(
              (replies || []).map(async (reply) => {
                const replyUserRes = await fetch(`/api/users/${reply.user_id}`);
                const { user: replyUserData } = replyUserRes.ok ? await replyUserRes.json() : { user: null };
                return { ...reply, user: replyUserData, reactions: reply.reactions || {} };
              })
            );
            
            return { ...comment, user: userData, reactions: comment.reactions || {}, replies: repliesWithUsers };
          })
        );
        
        setPosts(prev => prev.map(post =>
          post.forum_post_id === postId ? { ...post, comments: commentsWithUsers } : post
        ));
      }
      
      setShowComments(prev => new Set(prev).add(postId));
    }
  };
  
  const addComment = async (postId: string, parentPostId?: string) => {
    const key = parentPostId || postId;
    const text = commentText[key]?.trim();
    
    if (!text || !forumId) return;
    
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          forum_id: forumId,
          parent_post_id: parentPostId || postId,
          user_id: user?.id,
          content: text,
          media_type: 'text'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Don't manually update state - let real-time handle it
      setCommentText(prev => ({ ...prev, [key]: '' }));
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };
  
  const addCommentReaction = async (commentPostId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/forums/${forumId}/messages/${commentPostId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, emoji })
      });
      
      if (!res.ok) throw new Error('Failed to add reaction');
      
      const { reactions } = await res.json();
      
      setPosts(prev => prev.map(post => ({
        ...post,
        comments: post.comments?.map(c => {
          if (c.forum_post_id === commentPostId) {
            return { ...c, reactions };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(r =>
                r.forum_post_id === commentPostId ? { ...r, reactions } : r
              )
            };
          }
          return c;
        })
      })));
    } catch (error) {
      console.error('Error adding comment reaction:', error);
      toast.error('Failed to add reaction');
    }
  };
  
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content?.toLowerCase().includes(query) ||
      post.title?.toLowerCase().includes(query) ||
      post.user?.username?.toLowerCase().includes(query) ||
      post.user?.full_name?.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? db - da : da - db;
  });
  
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
    <div className="flex h-screen bg-[#1a1625]">
      {user?.role !== "artist" && <Navbar />}
      <CommunityHeader 
        slug={slug}
        communityName={communityData?.community_name}
        isSubscribed={true}
        isArtist={isArtist}
        currentPage="fan-art"
      />
      
      {/* Left Sidebar - Community Info */}
      <div className={`bg-[#2d2838] border-r border-gray-700 flex flex-col mt-16 transition-all duration-300 ${!isArtist ? 'ml-16' : ''} ${isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-80'}`}>
        {/* Community Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col items-center text-center">
            <img
              src={getImageUrl(communityData?.profile_picture_url || 'images/placeholder.jpg')}
              alt={communityData?.artist_name || 'Community'}
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <h2 className="text-white text-xl font-bold mb-2">{communityData?.community_name || 'Community'}</h2>
            <p className="text-white text-lg">#{communityData?.artist_name || 'Loading...'}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="text-gray-400">{communityData?.subscriber_count || 0} members</span>
              <span className="text-green-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {onlineCount} online
              </span>
            </div>
          </div>
        </div>

        {/* Guidelines Footer */}
        <div className="p-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm mb-4">Guidelines for {communityData?.artist_name || 'Artist'} Community</p>
          <div className="flex items-center justify-center gap-6">
            {communityData?.socials?.map((social, idx) => {
              const platform = social.platform.toLowerCase();
              return (
                <a 
                  key={idx}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  {platform === 'twitter' || platform === 'x' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  ) : platform === 'instagram' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  ) : platform === 'youtube' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  ) : platform === 'facebook' ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  ) : null}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col mt-16">
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute ${isArtist ? 'left-2' : 'left-[4.5rem]'} top-20 z-10 bg-[#2d2838] text-white p-2 rounded-full hover:bg-[#3d3848] transition`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isSidebarCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
        
        {/* Fan Art Header */}
        <div className="bg-[#2d2838] p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={getImageUrl(user?.photoURL || 'images/placeholder.jpg')}
                alt={user?.name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-white text-xl font-bold">{user?.name || 'User'}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">community joined 12.06.25</span>
                  {posts.length > 0 && (
                    <span className="text-[#FA6400]">{posts.length} new messages</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search fan art..."
                className="px-4 py-2 bg-[#1a1625] text-white placeholder-gray-500 rounded-full w-80 focus:outline-none focus:ring-2 focus:ring-[#FF4E27]"
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="px-3 py-2 bg-[#1a1625] text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4E27]"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      
      {/* Fan Art Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-full px-4">
          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">
                {searchQuery ? 'No fan art found matching your search' : 'No fan art yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-[#FA6400] text-white rounded-lg font-semibold hover:bg-[#e55a00] transition"
                >
                  Be the first to upload!
                </button>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-start">
          {filteredPosts.map((post) => (
            <div key={post.forum_post_id} className="relative rounded-xl bg-[#2d2838] border border-gray-700">
              {/* Image */}
              {post.media_urls?.[0] && (
                <div className="aspect-square overflow-hidden rounded-t-xl relative group">
                  <img
                    src={getImageUrl(post.media_urls[0])}
                    alt={post.title || "Fan art"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setExpandedImage(getImageUrl(post.media_urls[0]))}
                  />

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium pointer-events-auto cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); toggleComments(post.forum_post_id); }}>
                      💬 {post.commentCount || post.comments?.length || 0}
                    </span>
                    <span className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium pointer-events-auto cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setShowReactionPicker(showReactionPicker === post.forum_post_id ? null : post.forum_post_id); }}>
                      😀 React
                    </span>
                  </div>
                </div>
              )}

              {/* Emoji picker (fixed position, above everything) */}
              {showReactionPicker === post.forum_post_id && (
                <div className="fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <button onClick={() => setShowReactionPicker(null)} className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-gray-700 text-white rounded-full text-xs hover:bg-gray-600">✕</button>
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        addReaction(post.forum_post_id, emojiData.emoji);
                        setShowReactionPicker(null);
                      }}
                      height={350}
                      width={300}
                    />
                  </div>
                </div>
              )}

              {/* Info bar */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={getImageUrl(post.user?.profile_picture_url || 'images/placeholder.jpg')}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-white text-xs font-medium truncate">
                    {post.user?.username || post.user?.full_name || 'Unknown'}
                  </span>
                  <span className="text-gray-500 text-xs ml-auto">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                {post.content && (
                  <p className="text-gray-300 text-xs line-clamp-2">{post.content}</p>
                )}
                {/* Reactions */}
                {post.reactions && Object.keys(post.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(post.reactions).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(post.forum_post_id, emoji)}
                        className={`px-1.5 py-0.5 rounded-full text-xs ${
                          users.includes(user?.id || '') ? 'bg-[#FA6400] text-white' : 'bg-[#1a1625] text-gray-300'
                        }`}
                      >
                        {emoji} {users.length}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments section (expandable) */}
              {showComments.has(post.forum_post_id) && (
                <div className="border-t border-gray-700 p-3 space-y-2">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={commentText[post.forum_post_id] || ''}
                      onChange={(e) => setCommentText(prev => ({ ...prev, [post.forum_post_id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addComment(post.forum_post_id)}
                      placeholder="Comment..."
                      className="flex-1 min-w-0 px-2 py-1.5 bg-[#1a1625] text-white text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4E27]"
                    />
                    <button
                      onClick={() => addComment(post.forum_post_id)}
                      disabled={!commentText[post.forum_post_id]?.trim()}
                      className="px-2 py-1.5 bg-[#FA6400] text-white text-xs rounded-lg hover:bg-[#e55a00] transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      ➤
                    </button>
                  </div>
                  {(post.comments || []).map((comment: any, ci: number) => (
                    <div key={comment.comment_id || comment.forum_post_id || ci} className="flex gap-2 items-start">
                      <img src={getImageUrl(comment.user?.profile_picture_url || 'images/placeholder.jpg')} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <div>
                        <span className="text-white text-xs font-medium">{comment.user?.username || 'User'}</span>
                        <p className="text-gray-300 text-xs">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => toggleComments(post.forum_post_id)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition w-full text-center pt-1"
                  >
                    Hide comments
                  </button>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
      
      {/* Image Lightbox */}
      {expandedImage && (
        <div className="fixed inset-0 z-[9998] bg-black/90 flex items-center justify-center p-8 mt-16" onClick={() => setExpandedImage(null)}>
          <button onClick={() => setExpandedImage(null)} className="absolute top-20 right-6 text-white text-3xl hover:text-gray-300 z-10">✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={expandedImage} alt="Fan art" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Upload Button */}
      <div className="bg-[#2d2838] p-6 border-t border-gray-700">
        <div className="max-w-5xl mx-auto flex justify-center">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-12 py-3 bg-[#FA6400] text-white rounded-full font-bold text-lg hover:bg-[#e55a00] transition"
          >
            UPLOAD +
          </button>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2d2838] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold">Upload Fan Art</h2>
                <button
                  onClick={() => { setShowUploadModal(false); setSelectedFiles([]); setPreviewUrls([]); setTitle(''); setDescription(''); }}
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
                  onClick={() => { setShowUploadModal(false); setSelectedFiles([]); setPreviewUrls([]); setTitle(''); setDescription(''); }}
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
    </div>
  );
}
