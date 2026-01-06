'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  forum_post_id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  is_pinned: boolean;
  created_at: string;
  users?: {
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
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch community ID from slug first, then forum ID
  useEffect(() => {
    async function fetchCommunityAndForum() {
      try {
        // First, get artist data using slug
        const artistRes = await fetch(`/api/community/${slug}`);
        if (!artistRes.ok) {
          toast.error('Artist not found');
          router.push('/artist/dashboard');
          return;
        }
        
        const artistData = await artistRes.json();
        const commId = artistData.artist?.community?.community_id;
        
        if (!commId) {
          toast.error('No community found');
          router.push('/artist/dashboard');
          return;
        }
        
        setCommunityId(commId);
        
        // Now fetch forums using community_id
        const forumsRes = await fetch(`/api/communities/${commId}/forums`);
        if (forumsRes.ok) {
          const forumsData = await forumsRes.json();
          const chatForum = forumsData.forums.find((f: any) => f.forum_type === 'all_chat');
          if (chatForum) {
            setForumId(chatForum.forum_id);
          } else {
            toast.error('Chat forum not found');
            router.push('/artist/dashboard');
          }
        } else {
          toast.error('Failed to load forum');
          router.push('/artist/dashboard');
        }
      } catch (error) {
        console.error('Error fetching forum:', error);
        toast.error('Failed to load chat');
        router.push('/artist/dashboard');
      }
    }
    
    if (user && slug) {
      fetchCommunityAndForum();
    }
  }, [slug, router, user]);
  
  // Initialize Supabase Realtime
  useEffect(() => {
    if (!user || !forumId) return;
    
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
          
          // Fetch user details for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('user_id, username, full_name, profile_picture_url')
            .eq('user_id', payload.new.user_id)
            .single();
          
          const newMessage: Message = {
            ...payload.new as any,
            users: userData || undefined
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
      
      if (error) throw error;
      
      setInputMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      if (error.message?.includes('policy')) {
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
          onClick={() => router.push(`/artist/dashboard`)}
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
              src={msg.users?.profile_picture_url || '/images/placeholder.jpg'}
              alt={msg.users?.username || 'User'}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold">
                  {msg.users?.full_name || msg.users?.username || 'Unknown User'}
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
