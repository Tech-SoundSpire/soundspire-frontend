// This hook will protect the routes

'use client'

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useRequiredAuth = (redirectTo: string = '/') => {
  const {user , isLoading} = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!isLoading && !user){
      router.push(redirectTo);//Redirecting to login home
    }
  }, [user, isLoading, redirectTo, router]);
};

export default useRequiredAuth;


//use in pages useRequiredAuth('/');