'use client';

import { useAuth } from '@/context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { login, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/explore');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      await login('google');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* For Artists Button */}
      <div className="absolute top-4 right-4">
        <button className="px-6 py-2 rounded-full bg-[#FF2800] hover:bg-[#00BFFF] text-white font-semibold transition-colors duration-200">
          For Artists
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            {/* <img src="images/logo-Photoroom.png" alt="SoundSpire Logo" className="inline-block"/>  */}
            <img 
            src="images/logo-Photoroom.png"
            alt='SoundSpire Logo'
            className="inline-block"
            />
          </h1>
          <p className="text-white">
            The SuperFandom platform
          </p>
        </div>

        {/* Login Options */}
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-black font-semibold border border-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGoogle className="text-xl" />
            {isLoading ? 'Loading...' : 'Continue with Google'}
          </button>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-8 text-center text-sm text-white">
          By continuing, you agree to SoundSpire&apos;s{' '}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
