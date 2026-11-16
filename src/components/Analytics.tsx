"use client";
import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_KEY, GA_ID, getConsent, setConsent } from "@/utils/analytics";

// Loads Google Analytics 4 with Consent Mode v2 (all storage denied until the visitor
// accepts) and shows the consent banner. Renders nothing when NEXT_PUBLIC_GA_ID is unset.
export default function Analytics() {
    const [showBanner, setShowBanner] = useState(false);
    useEffect(() => { if (GA_ID && getConsent() === null) setShowBanner(true); }, []);
    if (!GA_ID) return null;

    const choose = (v: "granted" | "denied") => { setConsent(v); setShowBanner(false); };

    return (
        <>
            {/* Consent defaults must run before the tag; a stored "granted" choice is applied at once. */}
            <Script id="ga-consent" strategy="afterInteractive">{`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('consent', 'default', {
                    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
                    analytics_storage: 'denied'
                });
                try { if (localStorage.getItem('${CONSENT_KEY}') === 'granted') gtag('consent', 'update', { analytics_storage: 'granted' }); } catch (e) {}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
            `}</Script>
            <Script id="ga-tag" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />

            {showBanner && (
                <div role="dialog" aria-label="Analytics consent"
                    className="fixed bottom-20 md:bottom-4 inset-x-4 md:left-auto md:right-4 md:max-w-md z-[9999] rounded-xl border border-white/15 bg-[#1a1625]/95 backdrop-blur p-4 text-sm text-white shadow-2xl">
                    <p className="text-white/80 mb-3">
                        We use analytics cookies to understand how SoundSpire is used and improve it.
                        No ads, and you can decline. <Link href="/privacy" className="text-[#FF4E27] hover:underline">Privacy Policy</Link>
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => choose("denied")} className="px-4 py-2 rounded-lg text-white/70 hover:text-white">Decline</button>
                        <button onClick={() => choose("granted")} className="px-4 py-2 rounded-lg bg-[#FF4E27] hover:bg-[#e5431f] font-medium">Accept</button>
                    </div>
                </div>
            )}
        </>
    );
}
