import { useRouter } from 'next/navigation';
import BaseText from '@/components/BaseText/BaseText';
import toast from 'react-hot-toast';

interface CommunityHeaderProps {
  slug: string;
  communityName?: string;
  isSubscribed: boolean;
  isArtist?: boolean;
  currentPage: 'about' | 'forum' | 'all-chat' | 'fan-art' | 'suggestions';
}

export default function CommunityHeader({ slug, communityName, isSubscribed, isArtist = false, currentPage }: CommunityHeaderProps) {
  const router = useRouter();

  const handleNavigation = (page: string, requiresSubscription: boolean) => {
    if (requiresSubscription && !isSubscribed) {
      toast.error(`Subscribe to access ${page}`);
      return;
    }
    
    const routes: Record<string, string> = {
      'about': `/community/${slug}`,
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
    <header className="w-full bg-[#1a1625]/90 backdrop-blur-md py-4 px-8 flex items-center justify-center fixed top-0 left-0 z-50 text-white">
      <nav className="flex items-center justify-center gap-8 ml-auto">
        <button 
          onClick={() => handleNavigation('about', false)}
          className={`transition ${currentPage === 'about' ? 'text-[#FA6400] font-semibold' : 'hover:text-[#FA6400]'}`}
        >
          <BaseText wrapper="span" textColor="inherit" fontSize="normal">
            About
          </BaseText>
        </button>
        
        <button 
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
              : isSubscribed 
                ? 'hover:text-[#FA6400]' 
                : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isSubscribed}
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
              : isSubscribed 
                ? 'hover:text-[#FA6400]' 
                : 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!isSubscribed}
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

      {communityName && (
        <button
          onClick={handleCommunityNameClick}
          className="ml-auto hover:text-white transition"
        >
          <BaseText
            wrapper="span"
            textColor="#9ca3af"
            fontStyle="italic"
            fontWeight={500}
          >
            {communityName}
          </BaseText>
        </button>
      )}
    </header>
  );
}
