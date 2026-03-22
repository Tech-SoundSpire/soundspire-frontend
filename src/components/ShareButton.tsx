"use client";
import { FaRegPaperPlane } from "react-icons/fa6";
import { useState, useRef } from "react";
import BaseText from "./BaseText/BaseText";

export default function ShareButton({ url, dark = false, light = false, popupDirection = "up", iconOnly = false }: { url: string; dark?: boolean; light?: boolean; popupDirection?: "up" | "down"; iconOnly?: boolean }) {
    const [copied, setCopied] = useState(false);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleShare = async () => {
        const fullUrl = `${window.location.origin}${url}`;
        await navigator.clipboard.writeText(fullUrl);

        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPopupPos({
                top: popupDirection === "down" ? rect.bottom + 8 : rect.top - 40,
                left: rect.left + rect.width / 2,
            });
        }

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const color = light ? "text-white" : dark ? "text-black" : "text-black";
    const textColor = light ? "#ffffff" : "#000000";

    return (
        <>
            <button ref={btnRef} className={`flex items-center mr-4 ${color}`} onClick={handleShare}>
                <FaRegPaperPlane className={iconOnly ? "" : "mr-3"} />
                {!iconOnly && (
                    <BaseText wrapper="span" fontName="inter" fontSize="small" fontWeight={500} textColor={textColor}>
                        Share
                    </BaseText>
                )}
            </button>
            {copied && (
                <span
                    className="fixed -translate-x-1/2 px-3 py-1.5 rounded-lg text-white text-sm whitespace-nowrap pointer-events-none z-[9999]"
                    style={{
                        top: popupPos.top,
                        left: popupPos.left,
                        background: "linear-gradient(180deg, rgba(40,21,69,0.85) 0%, rgba(15,8,25,0.90) 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                    }}
                >
                    Copied to clipboard!
                </span>
            )}
        </>
    );
}

