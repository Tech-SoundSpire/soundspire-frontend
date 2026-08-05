import Link from "next/link";
import type { ReactNode } from "react";

// Shared shell for the public policy pages (terms / privacy / guidelines /
// artist-terms / delete-account).
export default function LegalPage({
  title,
  lastUpdated = "31 July 2026",
  pdfUrl,
  children,
}: {
  title: string;
  lastUpdated?: string;
  pdfUrl?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1a1625] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-[#FF4E27] text-sm hover:underline">← SoundSpire</Link>
        <h1 className="text-3xl font-black mt-6 mb-2">{title}</h1>
        <div className="flex items-center gap-3 mb-8">
          <p className="text-white/40 text-sm">Last updated: {lastUpdated}</p>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF4E27] text-sm hover:underline"
            >
              Download PDF
            </a>
          )}
        </div>
        <div className="legal-body space-y-4 text-white/80 text-sm leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-1 [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-[#FF4E27] [&_a:hover]:underline [&_strong]:text-white">
          {children}
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap gap-4 text-sm text-white/50">
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/community-guidelines" className="hover:text-white">Guidelines</Link>
          <Link href="/artist-terms" className="hover:text-white">Artist Terms</Link>
          <Link href="/child-safety" className="hover:text-white">Child Safety</Link>
          <Link href="/delete-account" className="hover:text-white">Delete account</Link>
        </div>
      </div>
    </div>
  );
}
