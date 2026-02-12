import { useRouter } from 'next/navigation';
import BaseText from '@/components/BaseText/BaseText';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getLogoUrl } from '@/utils/userProfileImageUtils';
import { useAuth } from '@/context/AuthContext';

interface CommunityHeaderProps {
  slug: string;
  communityName?: string;
  isSubscribed: boolean;
  isArtist?: boolean;
  currentPage: 'about' | 'forum' | 'all-chat' | 'fan-art' | 'suggestions';
  onLogout?: () => void;
  onSwitchToFan?: () => void;
}

export default function CommunityHeader({ slug, communityName, isSubscribed, isArtist = false, currentPage, onLogout, onSwitchToFan }: CommunityHeaderProps) {
  const router = useRouter();
  const { logout, switchRole } = useAuth();

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
        <span className="text-[#FA6400] font-bold text-lg hidden md:inline">SoundSpire</span>
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
          onClick={() => handleNavigation('forum', false)}
          className={`transition ${currentPage === 'forum' ? 'text-[#FA6400] font-semibold' : 'hover:text-[#FA6400]'}`}
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
                ? 'hover:text-[#FA6400]' 
                : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isSubscribed && !isArtist}
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
                ? 'hover:text-[#FA6400]' 
                : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isSubscribed && !isArtist}
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
