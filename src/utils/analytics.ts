// Google Analytics 4 helpers (browser-only). Tracking is off unless NEXT_PUBLIC_GA_ID is set,
// so dev/test deployments don't pollute production data. Visitors must accept analytics in
// the consent banner first (Google Consent Mode v2: denied by default).
const RAW_GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
// Only a well-formed GA4 id is used (it is written into an inline script).
export const GA_ID = /^G-[A-Z0-9]{4,20}$/.test(RAW_GA_ID) ? RAW_GA_ID : "";

export const CONSENT_KEY = "ss_analytics_consent"; // "granted" | "denied"

type Gtag = (...args: unknown[]) => void;
const gtag = (): Gtag | undefined =>
    typeof window !== "undefined" ? (window as unknown as { gtag?: Gtag }).gtag : undefined;

export function getConsent(): "granted" | "denied" | null {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: "granted" | "denied") {
    window.localStorage.setItem(CONSENT_KEY, value);
    gtag()?.("consent", "update", { analytics_storage: value });
}

// Key moments (sign up, join community, ...). No-op when GA is off; with consent denied,
// Consent Mode sends only cookieless signals.
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
    if (!GA_ID) return;
    gtag()?.("event", name, params || {});
}
