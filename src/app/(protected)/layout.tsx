'use client'
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
     const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null; // or a loading spinner
  }

  return (
    <>
        <Navbar/>
          {children}
    </>
  );
}
