'use client'

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface UseCheckCompleteProfileReturn {
    isProfileComplete: boolean;
    isLoading: boolean;
    error: string | null;
}

const useCheckCompleteProfileOnRoute = (): UseCheckCompleteProfileReturn => {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const checkProfile = async () => {
            if (authLoading || !user?.email) return;

            try {
                setIsLoading(true);
                setError(null);

                const res = await axios.get(`/api/profile?email=${encodeURIComponent(user.email)}`);
                const profile = res.data;

                const requiredFields = [
                    profile.full_name,
                    profile.gender,
                    profile.mobile_number,
                    profile.date_of_birth,
                    profile.city,
                    profile.country,
                ];

                const complete = requiredFields.every((f) => f && f.trim() !== '');
                setIsProfileComplete(complete);

                if (!complete) {
                    router.push('/complete-profile');
                }
            } catch (err) {
                console.error('Error checking profile completeness:', err);
                setError('Failed to check profile');
                router.push('/complete-profile');
            } finally {
                setIsLoading(false);
            }
        };

        checkProfile();
    }, [user, authLoading, router]);

    return { isProfileComplete, isLoading, error };
};


export default useCheckCompleteProfileOnRoute;