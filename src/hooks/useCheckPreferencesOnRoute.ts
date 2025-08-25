'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface UseCheckPreferencesOnRouteReturn {
  hasPreferences: boolean;
  isLoading: boolean;
  error: string | null;
}

const useCheckPreferencesOnRoute = (): UseCheckPreferencesOnRouteReturn => {
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

        // If user doesn't have preferences, redirect to preference selection
        if (!userHasPreferences) {
          router.push('/PreferenceSelectionPage');
        }

      } catch (err) {
        console.error('Error checking preferences:', error);
        setError('Failed to check preferences');
        // On error, assume no preferences and redirect to preference selection
        router.push('/PreferenceSelectionPage');
      } finally {
        setIsLoading(false);
      }
    };

    checkPreferences();
  }, [user, authLoading, router]);

  return { hasPreferences, isLoading, error };
};

export default useCheckPreferencesOnRoute;
