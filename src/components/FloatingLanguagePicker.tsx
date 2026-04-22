"use client";
import { useState, useRef, useEffect } from "react";
import { useLanguage, SUPPORTED_LANGUAGES, LangCode } from "@/context/LanguageContext";
import { useTranslation } from "@/context/TranslationContext";
import { HiOutlineLanguage } from "react-icons/hi2";

export default function FloatingLanguagePicker() {
    const { lang, setLang } = useLanguage();
    const { translatePage, showOriginal, isTranslating } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = async (code: LangCode) => {
        setOpen(false);
        if (code === lang) return;
        showOriginal();
        setLang(code);
        if (code !== "en") {
            // Pass the target lang explicitly to avoid stale closure
            setTimeout(() => translatePage(code), 200);
        }
    };

    const currentLabel = SUPPORTED_LANGUAGES.find(l => l.code === lang)?.nativeLabel ?? "English";

    return (
        <div ref={ref} className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[10000]" data-no-translate>
            {open && (
                <div className="absolute bottom-14 right-0 bg-[#241e33] border border-white/10 rounded-2xl shadow-2xl p-3 w-52 mb-2">
                    {SUPPORTED_LANGUAGES.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => handleSelect(l.code as LangCode)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition flex items-center justify-between ${
                                lang === l.code
                                    ? "bg-orange-500/20 text-orange-400 font-semibold"
                                    : "text-gray-300 hover:bg-white/5"
                            }`}
                        >
                            <span>{l.nativeLabel}</span>
                            <span className="text-[11px] opacity-50">{l.label}</span>
                        </button>
                    ))}
                </div>
            )}
            <button
                onClick={() => setOpen(!open)}
                disabled={isTranslating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-orange-500 text-white text-sm font-medium shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50"
            >
                <HiOutlineLanguage className={`text-lg ${isTranslating ? "animate-spin" : ""}`} />
                {isTranslating ? "Translating..." : currentLabel}
            </button>
        </div>
    );
}
