'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  // image?: string;
  provider: 'local';
  // accessToken?: string;
  // refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // login: (provider: 'google' | 'spotify') => Promise<void>;
  // logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Checking for the active session of the user
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data?.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Protect routes
  // useEffect(() => {
  //   if (!isLoading) {
  //     if (!user && pathname !== '/') {
  //       router.push('/');
  //     }
  //   }
  // }, [user, isLoading, pathname, router]);
   useEffect(() => {
    if (!isLoading && !user && pathname !== '/') {
      router.push('/');
    }
  }, [user, isLoading, pathname]);


  // const login = async (provider: 'google' | 'spotify') => {
  //   try {
  //     setIsLoading(true);
      
  //     if (provider === 'google') {
  //       // Redirect to Google OAuth endpoint
  //       window.location.href = '/api/auth/google';
  //     } else if (provider === 'spotify') {
  //       // TODO: Implement Spotify OAuth
  //       console.log('Spotify login not implemented yet');
  //     }
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const logout = async () => {
  //   try {
  //     setIsLoading(true);
  //     await fetch('/api/auth/logout', { method: 'POST' });
  //     setUser(null);
  //     router.push('/');
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // return (
  //   <AuthContext.Provider value={{ user, isLoading, login, logout }}>
  //     {children}
  //   </AuthContext.Provider>
  // );
  return (
    <AuthContext.Provider value={{ user, isLoading}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 