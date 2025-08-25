'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface UseCheckPreferencesReturn {
  hasPreferences: boolean;
  isLoading: boolean;
  error: string | null;
}

const useCheckPreferences = (): UseCheckPreferencesReturn => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [hasPreferences, setHasPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPreferences = async () => {
      if (authLoading || !user) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get(`/api/preferences/check?userId=${user.id}`);
        const { hasPreferences: userHasPreferences } = response.data;

        setHasPreferences(userHasPreferences);

        // If user has preferences, redirect to explore
        if (userHasPreferences) {
          router.push('/explore');
        }
        // If no preferences, stay on current page (preference selection)
        // The preference selection page will handle the flow

      } catch (err) {
        console.error('Error checking preferences:', err);
        setError('Failed to check preferences');
        // On error, assume no preferences and stay on preference selection
        setHasPreferences(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPreferences();
  }, [user, authLoading, router]);

  return { hasPreferences, isLoading, error };
};

export default useCheckPreferences;
