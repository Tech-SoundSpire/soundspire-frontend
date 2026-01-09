'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface UseCheckPreferencesOnRouteReturn {
  hasPreferences: boolean;
  isLoading: boolean;
  error: string | null;
}

const useCheckPreferencesOnRoute = (): UseCheckPreferencesOnRouteReturn => {
  const { user, isLoading: authLoading } = useAuth();
  const [hasPreferences, setHasPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPreferences = async () => {
      // If auth is still loading, wait
      if (authLoading) return;
      
      // If no user, stop loading immediately
      if (!user) {
        setIsLoading(false);
        setHasPreferences(false);
        return;
      }

      if (user.role === "artist") {
        setHasPreferences(true);
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const response = await axios.get(`/api/preferences/check?userId=${user.id}`);
        const { hasPreferences: userHasPreferences } = response.data;
        setHasPreferences(userHasPreferences);
      } catch (err) {
        console.error("Error checking preferences:", err);
        setError("Failed to check preferences");
        setHasPreferences(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPreferences();
  }, [user, authLoading]);

  return { hasPreferences, isLoading, error };
};

export default useCheckPreferencesOnRoute;
