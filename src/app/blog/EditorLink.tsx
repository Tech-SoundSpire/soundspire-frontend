"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isBlogEditorEmail } from "@/utils/blogEditor";

// "New post" / "Edit" button, shown only to @soundspire.online accounts.
export default function EditorLink({ href, label }: { href: string; label: string }) {
    const { user } = useAuth();
    if (!isBlogEditorEmail(user?.email)) return null;
    return (
        <Link href={href} className="px-4 py-2 rounded-lg bg-[#FF4E27] hover:bg-[#e5431f] text-white text-sm font-medium">
            {label}
        </Link>
    );
}
