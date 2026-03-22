"use client";
import { FaRegPaperPlane } from "react-icons/fa6";
import { useState } from "react";
import BaseText from "./BaseText/BaseText";

export default function ShareButton({ url, dark = false, light = false }: { url: string; dark?: boolean; light?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const fullUrl = `${window.location.origin}${url}`;
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const color = light ? "text-white" : dark ? "text-black" : "text-black";
    const textColor = light ? "#ffffff" : "#000000";

    return (
        <div className="relative inline-flex">
            <button className={`flex items-center mr-4 ${color}`} onClick={handleShare}>
                <FaRegPaperPlane className="mr-3" />
                <BaseText wrapper="span" fontName="inter" fontSize="small" fontWeight={500} textColor={textColor}>
                    Share
                </BaseText>
            </button>
            {copied && (
                <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-white text-sm whitespace-nowrap pointer-events-none z-50"
                    style={{
                        background: "linear-gradient(180deg, rgba(40,21,69,0.85) 0%, rgba(15,8,25,0.90) 100%)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                    }}
                >
                    Copied to clipboard!
                </div>
            )}
        </div>
    );
}

