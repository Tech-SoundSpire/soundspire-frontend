'use client';
import { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string | null ;
  provider: 'local';
 
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
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
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