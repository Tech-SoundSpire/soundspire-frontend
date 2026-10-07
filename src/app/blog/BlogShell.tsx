import Link from "next/link";
import type { ReactNode } from "react";

// Public blog layout: same look as the policy pages (LegalPage), wider column for articles.
export default function BlogShell({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#1a1625] text-white">
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4 text-sm">
                        <Link href="/" className="text-[#FF4E27] hover:underline">← SoundSpire</Link>
                        <Link href="/blog" className="text-white/60 hover:text-white">Blog</Link>
                    </div>
                    {actions}
                </div>
                {children}
            </div>
        </div>
    );
}
