'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getImageUrl } from '@/utils/userProfileImageUtils';

interface Message {
  forum_post_id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  is_pinned: boolean;
  created_at: string;
  user?: {
    user_id: string;
    username: string;
    full_name: string;
    profile_picture_url: string;
  };
}

export default function AllChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [forumId, setForumId] = useState<string | null>(null);
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isArtist, setIsArtist] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch community ID from slug first, then forum ID
  useEffect(() => {
    async function fetchCommunityAndForum() {
      try {
        // slug could be either the actual slug OR a UUID (community_id)
        // Try fetching as slug first
        const artistRes = await fetch(`/api/community/${slug}`);
        
        let commId: string | null = null;
        
        if (artistRes.ok) {
          // It's a slug
          const artistData = await artistRes.json();
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
        
        // Check if current user is the artist
        const artistCheckRes = await fetch(`/api/artist/me`);
        if (artistCheckRes.ok) {
          const artistData = await artistCheckRes.json();
          setIsArtist(artistData.artist?.community?.community_id === commId);
        }
        
        // Now fetch forums using community_id
        const forumsRes = await fetch(`/api/communities/${commId}/forums`);
        if (forumsRes.ok) {
          const forumsData = await forumsRes.json();
          const chatForum = forumsData.forums.find((f: any) => f.forum_type === 'all_chat');
          if (chatForum) {
            setForumId(chatForum.forum_id);
          } else {
            setLoading(false);
            toast.error('Chat forum not found. Please contact admin.');
            router.push('/feed');
          }
        } else {
          setLoading(false);
          toast.error('Failed to load forum');
          router.push('/feed');
        }
      } catch (error) {
        console.error('Error fetching forum:', error);
        setLoading(false);
        toast.error('Failed to load chat');
        router.push(`/community/${slug}`);
      }
    }
    
    if (user && slug) {
      fetchCommunityAndForum();
    }
  }, [slug, router, user]);
  
  // Initialize Supabase Realtime
  useEffect(() => {
    if (!user || !forumId) return;
    
    // Test Supabase connection
    console.log('🔵 Testing Supabase connection:', {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      forumId,
      userId: user.id
    });

    // Fetch initial messages
    fetchMessages();
    
    // Create Realtime channel for this forum
    const channel = supabase.channel(`forum:${forumId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });
    
    // Subscribe to new messages (INSERT events)
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forum_posts',
          filter: `forum_id=eq.${forumId}`
        },
        async (payload) => {
          console.log('New message received:', payload.new);
          
          // Fetch user details via API route (bypasses RLS)
          const userRes = await fetch(`/api/users/${payload.new.user_id}`);
          const { user: userData } = userRes.ok ? await userRes.json() : { user: null };
          
          const newMessage: Message = {
            ...payload.new as any,
            user: userData || undefined
          };
          
          setMessages(prev => [...prev, newMessage]);
          setTimeout(scrollToBottom, 100);
        }
      )
      // Subscribe to message updates (PIN events)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forum_posts',
          filter: `forum_id=eq.${forumId}`
        },
        (payload) => {
          console.log('Message updated:', payload.new);
          
          setMessages(prev => prev.map(msg =>
            msg.forum_post_id === payload.new.forum_post_id
              ? { ...msg, is_pinned: payload.new.is_pinned }
              : msg
          ));
          
          if (payload.new.is_pinned && !payload.old?.is_pinned) {
            toast.success('Message pinned');
          }
        }
      )
      // Presence tracking (who's online)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = new Set(Object.keys(state));
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key);
      })
      // Broadcast for typing indicators
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        console.log('User typing:', payload.username);
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          toast.success('Connected to chat');
          
          // Track presence
          channel.track({
            user_id: user.id,
            username: user.name,
            online_at: new Date().toISOString()
          });
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        } else if (status === 'CHANNEL_ERROR') {
          toast.error('Failed to connect to chat');
        }
      });
    
    channelRef.current = channel;
    
    return () => {
      channel.unsubscribe();
    };
  }, [user, forumId]);
  
  const fetchMessages = async () => {
    if (!forumId) return;
    
    try {
      setLoading(true);
      
      // Fetch from API route
      const res = await fetch(`/api/forums/${forumId}/messages?limit=50`);
      
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setTimeout(scrollToBottom, 100);
      } else {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!inputMessage.trim() || !forumId || !user) return;
    
    try {
      console.log('🔵 Attempting to send message:', {
        forumId,
        userId: user.id,
        content: inputMessage.substring(0, 20) + '...',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      });

      // Insert via Supabase - Realtime will auto-broadcast
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          forum_id: forumId,
          user_id: user.id,
          content: inputMessage,
          media_type: 'text',
          media_urls: []
        })
        .select()
        .single();
      
      if (error) {
        console.error('🔴 Supabase insert error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Message sent successfully:', data);
      setInputMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      if (error.code === '42501') {
        toast.error('Permission denied. Check Supabase RLS policies.');
      } else if (error.message?.includes('policy')) {
        toast.error('You need an active subscription to send messages');
      } else {
        toast.error('Failed to send message');
      }
    }
  };
  
  const handleTyping = () => {
    if (!channelRef.current) return;
    
    // Send typing indicator via broadcast
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: user?.id,
        username: user?.name 
      }
    });
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1625]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading chat...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-[#1a1625]">
      {/* Header */}
      <div className="bg-[#2d2838] p-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">All Chat</h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-400 text-sm">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
            {onlineUsers.size > 0 && (
              <p className="text-gray-400 text-sm">
                👥 {onlineUsers.size} online
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push(isArtist ? '/artist/dashboard' : `/community/${slug}`)}
          className="text-gray-400 hover:text-white transition"
        >
          ← Back
        </button>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.forum_post_id} 
            className={`flex gap-3 ${msg.is_pinned ? 'bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-500' : ''}`}
          >
            {msg.is_pinned && (
              <div className="text-yellow-500 text-xs flex-shrink-0">📌</div>
            )}
            <img
              src={getImageUrl(msg.user?.profile_picture_url || 'images/placeholder.jpg')}
              alt={msg.user?.username || 'User'}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold">
                  {msg.user?.full_name || msg.user?.username || 'Unknown User'}
                </span>
                <span className="text-gray-500 text-xs">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
                {msg.is_pinned && (
                  <span className="text-yellow-500 text-xs font-semibold">PINNED</span>
                )}
              </div>
              <p className="text-gray-300 mt-1 break-words">{msg.content}</p>
              {msg.media_urls && msg.media_urls.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.media_urls.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url}
                      alt="Shared image"
                      className="max-w-md rounded-lg cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="bg-[#2d2838] p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-lg bg-[#1a1625] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="px-6 py-3 bg-[#FA6400] text-white rounded-lg font-semibold hover:bg-[#e55a00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Press Enter to send • {isConnected ? 'Connected' : 'Disconnected'}
        </p>
      </div>
    </div>
  );
}
