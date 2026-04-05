"use client";
import { createContext, useContext, useCallback, useRef, useState, useEffect } from "react";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/context/LanguageContext";
import { getCachedTranslation, setCachedTranslation } from "@/utils/translationCache";
import { usePathname } from "next/navigation";

interface TranslationContextType {
    translatePage: (targetLang?: string) => Promise<void>;
    showOriginal: () => void;
    isTranslated: boolean;
    isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const MIN_TEXT_LENGTH = 2;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT", "SVG"]);
const BATCH_SIZE = 30;
const TRANSLATED_ATTR = "data-translated";

function shouldTranslate(node: Text): boolean {
    const text = node.textContent?.trim();
    if (!text || text.length < MIN_TEXT_LENGTH) return false;
    const parent = node.parentElement;
    if (!parent) return false;
    if (SKIP_TAGS.has(parent.tagName)) return false;
    if (parent.closest("[data-no-translate]")) return false;
    if (!/[a-zA-Z\u00C0-\u024F\u0400-\u04FF]/.test(text)) return false;
    return true;
}

function collectUntranslatedNodes(): { node: Text; original: string }[] {
    const results: { node: Text; original: string }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const parent = node.parentElement;
        // Skip already-translated nodes (marked on parent)
        if (parent?.hasAttribute(TRANSLATED_ATTR)) continue;
        if (shouldTranslate(node)) {
            results.push({ node, original: node.textContent! });
        }
    }
    return results;
}

async function batchTranslate(
    texts: string[],
    langCode: string,
    langLabel: string,
): Promise<Map<string, string>> {
    const translationMap = new Map<string, string>();
    const uncached: string[] = [];

    for (const text of texts) {
        const cached = getCachedTranslation(text, langCode);
        if (cached) translationMap.set(text, cached);
        else uncached.push(text);
    }

    for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
        const batch = uncached.slice(i, i + BATCH_SIZE);
        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: batch, targetLang: langLabel }),
            });
            const data = await res.json();
            if (data.translations) {
                batch.forEach((text, idx) => {
                    const translated = data.translations[idx];
                    if (translated) {
                        setCachedTranslation(text, langCode, translated);
                        translationMap.set(text, translated);
                    }
                });
            }
        } catch { /* keep originals */ }
    }
    return translationMap;
}

function applyTranslations(entries: { node: Text; original: string }[], translationMap: Map<string, string>) {
    for (const { node, original } of entries) {
        const translated = translationMap.get(original.trim());
        if (translated && node.parentNode && document.body.contains(node)) {
            node.textContent = translated;
            // Mark parent so we don't re-translate
            node.parentElement?.setAttribute(TRANSLATED_ATTR, original);
        }
    }
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
    const { lang } = useLanguage();
    const langRef = useRef(lang);
    const [isTranslated, setIsTranslated] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const activeRef = useRef(false);
    const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const busyRef = useRef(false); // prevent overlapping scans
    const pathname = usePathname();

    useEffect(() => { langRef.current = lang; }, [lang]);

    const translateNodes = useCallback(async (overrideLang?: string) => {
        const activeLang = overrideLang ?? langRef.current;
        if (activeLang === "en") return;
        if (busyRef.current) return;
        busyRef.current = true;

        const langLabel = SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.nativeLabel ?? activeLang;
        const entries = collectUntranslatedNodes();

        if (entries.length > 0) {
            const uniqueTexts = [...new Set(entries.map(e => e.original.trim()))];
            // Check if all are cached (no need to show spinner for cache hits)
            const hasUncached = uniqueTexts.some(t => !getCachedTranslation(t, activeLang));
            if (hasUncached) setIsTranslating(true);

            const translationMap = await batchTranslate(uniqueTexts, activeLang, langLabel);
            applyTranslations(entries, translationMap);

            if (hasUncached) setIsTranslating(false);
        }

        busyRef.current = false;
    }, []);

    const startScanning = useCallback((overrideLang?: string) => {
        activeRef.current = true;
        // Initial translate
        translateNodes(overrideLang);
        // Re-scan every 2s to catch async-loaded content
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = setInterval(() => {
            if (activeRef.current && !busyRef.current) translateNodes();
        }, 2000);
    }, [translateNodes]);

    const stopScanning = useCallback(() => {
        if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    }, []);

    const showOriginal = useCallback(() => {
        activeRef.current = false;
        stopScanning();
        // Revert all translated nodes using the stored original in the attribute
        document.querySelectorAll(`[${TRANSLATED_ATTR}]`).forEach(el => {
            const original = el.getAttribute(TRANSLATED_ATTR);
            if (original && el.firstChild?.nodeType === Node.TEXT_NODE) {
                el.firstChild.textContent = original;
            }
            el.removeAttribute(TRANSLATED_ATTR);
        });
        setIsTranslated(false);
    }, [stopScanning]);

    const translatePage = useCallback(async (overrideLang?: string) => {
        const activeLang = overrideLang ?? langRef.current;
        if (activeLang === "en") return;
        setIsTranslated(true);
        startScanning(activeLang);
    }, [startScanning]);

    // Auto-translate on route change
    useEffect(() => {
        if (langRef.current === "en") return;
        const timer = setTimeout(() => {
            showOriginal();
            translatePage();
        }, 300);
        return () => clearTimeout(timer);
    }, [pathname, translatePage, showOriginal]);

    // Cleanup on unmount
    useEffect(() => () => stopScanning(), [stopScanning]);

    return (
        <TranslationContext.Provider value={{ translatePage, showOriginal, isTranslated, isTranslating }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const ctx = useContext(TranslationContext);
    if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
    return ctx;
}
