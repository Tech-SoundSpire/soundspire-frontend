"use client";
import { getFontClass } from "@/utils/getFontClass";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import BlockedUsersList from "@/components/moderation/BlockedUsersList";

export default function SettingsPage() {
    const montserrat = getFontClass("montserrat");
    const { user } = useAuth();

    return (
        <div className="min-h-screen md:ml-[54px] px-6 py-12 flex flex-col items-center gap-8">
            <h1 className={`${montserrat} text-[#FFD3C9] text-3xl font-bold`}>Settings</h1>

            <BlockedUsersList />

            <div className="w-full max-w-md flex flex-col gap-2 text-sm">
                {user?.isAdmin && (
                    <Link href="/admin/moderation" className="text-[#FF4E27] hover:underline">Moderation dashboard</Link>
                )}
                <Link href="/profile" className="text-white/60 hover:text-white">Delete account</Link>
                <div className="flex gap-4 text-white/40 pt-2">
                    <Link href="/terms" className="hover:text-white">Terms</Link>
                    <Link href="/privacy" className="hover:text-white">Privacy</Link>
                    <Link href="/community-guidelines" className="hover:text-white">Guidelines</Link>
                    <Link href="/child-safety" className="hover:text-white">Child Safety</Link>
                </div>
            </div>
        </div>
    );
}
