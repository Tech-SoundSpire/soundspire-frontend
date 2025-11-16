'use client';
import { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string | null;
  provider: 'local' | string; // allows flexibility for 'google', etc.
  role: 'user' | 'artist';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/session', { credentials: 'include' });
      const data = await res.json();

      if (data?.user) {
        const normalizedUser: User = {
          id: data.user.id,
          name: data.user.name || '',
          email: data.user.email || '',
          photoURL: data.user.photoURL || data.user.image || null,
          provider: data.user.provider || 'local',
          role: data.user.role || 'user',
        };
        setUser(normalizedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession()
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout, refreshUser: checkSession }}>
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
