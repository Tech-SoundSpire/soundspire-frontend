'use client'

import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

interface UseCheckCompleteProfileReturn {
    isProfileComplete: boolean;
    isLoading: boolean;
    error: string | null;
}

const useCheckCompleteProfileOnRoute = (): UseCheckCompleteProfileReturn => {
    const { user, isLoading: authLoading } = useAuth();
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkProfile = async () => {
            // If auth is still loading, wait
            if (authLoading) return;
            
            // If no user, stop loading immediately
            if (!user) {
                setIsLoading(false);
                setIsProfileComplete(false);
                return;
            }

            if (!user.email) {
                setIsLoading(false);
                setIsProfileComplete(false);
                return;
            }

            if (user.role === "artist") {
                setIsProfileComplete(true);
                setIsLoading(false);
                return;
            }

            try {
                setError(null);
                const res = await axios.get(`/api/profile?email=${encodeURIComponent(user.email)}`);
                const profile = res.data;

                // For artist-turned-fan, only gender and DOB are required extras
                const requiredFields = user.isAlsoArtist
                    ? [profile.gender, profile.date_of_birth]
                    : [
                        profile.full_name,
                        profile.gender,
                        profile.mobile_number,
                        profile.date_of_birth,
                        profile.city,
                        profile.country,
                    ];

                const complete = requiredFields.every((f) => f && String(f).trim() !== '');
                setIsProfileComplete(complete);
            } catch (err) {
                console.error("Error checking profile completeness:", err);
                setError("Failed to check profile");
                setIsProfileComplete(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkProfile();
    }, [user, authLoading]);

    return { isProfileComplete, isLoading, error };
};


export default useCheckCompleteProfileOnRoute;