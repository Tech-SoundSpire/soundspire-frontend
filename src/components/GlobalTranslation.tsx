"use client";
import { TranslationProvider } from "@/context/TranslationContext";
import FloatingLanguagePicker from "@/components/FloatingLanguagePicker";

export default function GlobalTranslation({ children }: { children: React.ReactNode }) {
    return (
        <TranslationProvider>
            {children}
            <FloatingLanguagePicker />
        </TranslationProvider>
    );
}
