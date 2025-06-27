'use client';

import { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  provider: 'local';

   displayName?: string;           
  photoURL?: string;              
  is_verified?: boolean;            
  spotifyLinked?: boolean;   
  
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; 

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const router = useRouter();
  // const pathname = usePathname();

  useEffect(() => {
    // Checking for the active session of the user
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session',{credentials: "include"});
        const data = await response.json();
        
        if (data?.user) {
           const userData: User = {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            provider: data.user.provider || 'local',

            // Optional fields mapped safely
            displayName: data.user.displayName,
            photoURL: data.user.photoURL,
            is_verified: data.user.is_verified,
            spotifyLinked: data.user.spotifyLinked,
          };

          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

 
  return (
    <AuthContext.Provider value={{ user, isLoading,setUser}}>
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