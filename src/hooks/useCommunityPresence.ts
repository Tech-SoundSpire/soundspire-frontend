import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function useCommunityPresence(communityId: string | null) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [onlineUserDetails, setOnlineUserDetails] = useState<Map<string, any>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (!user || !communityId) return;

    const presenceChannel = supabase.channel(`community:${communityId}:presence`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = new Set(Object.keys(state));
        setOnlineUsers(users);

        const details = new Map();
        Object.entries(state).forEach(([userId, presences]: [string, any]) => {
          if (presences && presences.length > 0) {
            details.set(userId, presences[0]);
          }
        });
        setOnlineUserDetails(details);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (newPresences && newPresences.length > 0) {
          setOnlineUserDetails(prev => new Map(prev).set(key, newPresences[0]));
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUserDetails(prev => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId, username } = payload;
        if (userId === user.id) return;
        
        setTypingUsers(prev => new Set(prev).add(username));
        
        if (typingTimeoutRef.current[userId]) {
          clearTimeout(typingTimeoutRef.current[userId]);
        }
        
        typingTimeoutRef.current[userId] = setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(username);
            return next;
          });
        }, 3000);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          presenceChannel.track({
            user_id: user.id,
            username: user.name,
            online_at: new Date().toISOString()
          });
        }
      });

    channelRef.current = presenceChannel;

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user, communityId]);

  const broadcastTyping = (username: string) => {
    if (channelRef.current && user) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, username }
      });
    }
  };

  return { onlineUsers, onlineUserDetails, onlineCount: onlineUsers.size, typingUsers, broadcastTyping };
}
