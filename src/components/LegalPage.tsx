import Link from "next/link";
import type { ReactNode } from "react";

// Shared shell for the public policy pages (terms / privacy / guidelines /
// delete-account). Placeholder content for now; real legal copy comes later.
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1a1625] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-[#FF4E27] text-sm hover:underline">← SoundSpire</Link>
        <h1 className="text-3xl font-black mt-6 mb-2">{title}</h1>
        <p className="text-white/40 text-sm mb-8">Last updated: 30 July 2026</p>
        <div className="space-y-4 text-white/80 text-sm leading-relaxed">{children}</div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/50">
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/community-guidelines" className="hover:text-white">Guidelines</Link>
          <Link href="/delete-account" className="hover:text-white">Delete account</Link>
        </div>
      </div>
    </div>
  );
}
