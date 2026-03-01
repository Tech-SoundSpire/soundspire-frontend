import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import BaseText from '@/components/BaseText/BaseText';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getLogoUrl } from '@/utils/userProfileImageUtils';
import { useAuth } from '@/context/AuthContext';
import { FaBell } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';

interface CommunityHeaderProps {
  slug: string;
  communityName?: string;
  isSubscribed: boolean;
  isArtist?: boolean;
  currentPage: 'about' | 'forum' | 'all-chat' | 'fan-art' | 'suggestions';
  onLogout?: () => void;
  onSwitchToFan?: () => void;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function CommunityHeader({ slug, communityName, isSubscribed, isArtist = false, currentPage, onLogout, onSwitchToFan }: CommunityHeaderProps) {
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch unread count for artists
  const fetchUnread = useCallback(async () => {
    if (!isArtist || !user?.id) return;
    try {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount ?? 0);
        setNotifications(data.notifications ?? []);
      }
    } catch { /* ignore */ }
  }, [isArtist, user?.id]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  // Realtime notifications for artists
  useEffect(() => {
    if (!isArtist || !user?.id) return;
    const channel = supabase
      .channel(`artist-notif:${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        setUnreadCount((prev) => prev + 1);
                setNotifications((prev) => [payload.new, ...prev]);
        toast((t) => (
          <div className="flex items-center gap-3 max-w-sm">
            <span className="flex-1 text-sm">{payload.new.message}</span>
            <button onClick={async () => {
              toast.dismiss(t.id);
              const link = payload.new.link;
              const isOwnCommunity = link.includes(`/community/${slug}/`);
              if (!isOwnCommunity && (link.startsWith("/feed") || link.startsWith("/community/"))) {
                await switchRole("user");
              }
              router.push(link);
            }} className="text-[#FF4E27] font-semibold text-sm whitespace-nowrap">View</button>
            <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-white text-lg leading-none ml-1">×</button>
          </div>
        ), { duration: 3000, style: { background: "#1a1625", color: "#fff", border: "1px solid #FF4E27", padding: "12px 16px" } });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [isArtist, user?.id, router]);

  const defaultLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    setTimeout(() => router.push("/artist-onboarding"), 2000);
  };

  const defaultSwitchToFan = async () => {
    await switchRole("user");
    router.push("/explore");
  };

  const handleNavigation = (page: string, requiresSubscription: boolean) => {
    if (requiresSubscription && !isSubscribed && !isArtist) {
      toast.error(`Subscribe to access ${page}`);
      return;
    }
    
    if (page === 'about' && isArtist) {
      router.push('/artist/dashboard');
      return;
    }

    const routes: Record<string, string> = {
      'about': `/community/${slug}`,
      'forum': `/community/${slug}/forum`,
      'all-chat': `/community/${slug}/all-chat`,
      'fan-art': `/community/${slug}/fan-art`,
    };
    
    if (routes[page]) {
      router.push(routes[page]);
    }
  };
  
  const handleCommunityNameClick = () => {
    if (isArtist) {
      router.push('/artist/dashboard');
    } else {
      handleNavigation('about', false);
    }
  };

  return (
    <header className="w-full bg-[#1a1625]/90 backdrop-blur-md py-3 px-8 flex items-center justify-between fixed top-0 left-0 z-50 text-white border-b border-gray-800">
      <Link href={isArtist ? "/artist/dashboard" : `/community/${slug}`} className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={getLogoUrl()} alt="SoundSpire" width={36} height={36} className="object-contain" />
        {isArtist && <span className="text-[#FF4E27] font-bold text-lg hidden md:inline">SoundSpire</span>}
      </Link>

      <nav className="flex items-center justify-center gap-8">
        <button 
          onClick={() => handleNavigation('about', false)}
          className={`transition ${currentPage === 'about' ? 'text-[#FA6400] font-semibold' : 'hover:text-[#FA6400]'}`}
        >
          <BaseText wrapper="span" textColor="inherit" fontSize="normal">
            {isArtist ? 'Home' : 'About'}
          </BaseText>
        </button>
        
        <button 
          onClick={() => handleNavigation('forum', true)}
          className={`transition ${
            currentPage === 'forum' 
              ? 'text-[#FA6400] font-semibold' 
              : (isSubscribed || isArtist)
                ? 'hover:text-[#FA6400] cursor-pointer' 
                : 'opacity-50 cursor-not-allowed pointer-events-none'
          }`}
        >
          <BaseText wrapper="span" textColor="inherit" fontSize="normal">
            Artist Forum
          </BaseText>
        </button>
        
        <button 
          onClick={() => handleNavigation('all-chat', true)}
          className={`transition ${
            currentPage === 'all-chat' 
              ? 'text-[#FA6400] font-semibold' 
              : (isSubscribed || isArtist)
                ? 'hover:text-[#FA6400] cursor-pointer' 
                : 'opacity-50 cursor-not-allowed pointer-events-none'
          }`}
        >
          <BaseText wrapper="span" textColor="inherit" fontSize="normal">
            All Chat
          </BaseText>
        </button>
        
        <button 
          onClick={() => handleNavigation('fan-art', true)}
          className={`transition ${
            currentPage === 'fan-art' 
              ? 'text-[#FA6400] font-semibold' 
              : (isSubscribed || isArtist)
                ? 'hover:text-[#FA6400] cursor-pointer' 
                : 'opacity-50 cursor-not-allowed pointer-events-none'
          }`}
        >
          <BaseText wrapper="span" textColor="inherit" fontSize="normal">
            Fan Art
          </BaseText>
        </button>
        
        <button 
          className={`transition ${currentPage === 'suggestions' ? 'text-[#FA6400] font-semibold' : 'hover:text-[#FA6400]'}`}
        >
          <BaseText wrapper="span" textColor="inherit" fontSize="normal">
            Suggestions
          </BaseText>
        </button>
      </nav>

      {communityName ? (
        <button
          onClick={handleCommunityNameClick}
          className="hover:text-white transition"
        >
          <BaseText wrapper="span" textColor="#9ca3af" fontStyle="italic" fontWeight={500}>
            {communityName}
          </BaseText>
        </button>
      ) : <div />}

      {isArtist && (
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => {
              setShowNotifPanel(!showNotifPanel);
              if (!showNotifPanel && unreadCount > 0) {
                fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ notificationIds: "all" }) }).catch(() => {});
                setUnreadCount(0);
              }
            }} className="relative p-2 hover:bg-[#3d2b5a] rounded-lg transition">
              <FaBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4E27] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center leading-none px-0.5">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {showNotifPanel && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-[#1a1625] border border-gray-700 rounded-xl shadow-2xl z-50">
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <span className="text-sm font-semibold">Notifications</span>
                  <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
                ) : (
                  notifications.slice(0, 20).map((n: any) => (
                    <div
                      key={n.notification_id}
                      onClick={async () => {
                        setShowNotifPanel(false);
                        // If link goes to /feed or a community that's not ours, switch to fan first
                        const isOwnCommunity = n.link.includes(`/community/${slug}/`);
                        if (!isOwnCommunity && (n.link.startsWith("/feed") || n.link.startsWith("/community/"))) {
                          await switchRole("user");
                        }
                        router.push(n.link);
                      }}
                      className={`px-4 py-3 cursor-pointer hover:bg-[#2d2838] transition border-b border-gray-800 last:border-0 ${!n.is_read ? "bg-[#2d2838]/40" : ""}`}
                    >
                      <p className="text-sm text-white">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={onLogout || defaultLogout} className="px-4 py-1.5 bg-[#FA6400] hover:bg-[#e55a00] text-white font-bold rounded-lg transition text-sm">
            Logout
          </button>
          <button onClick={onSwitchToFan || defaultSwitchToFan} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-sm">
            Switch to Fan
          </button>
        </div>
      )}
    </header>
  );
}
