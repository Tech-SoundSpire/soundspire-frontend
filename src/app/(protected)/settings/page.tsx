"use client";
import { getFontClass } from "@/utils/getFontClass";
import { FaCog } from "react-icons/fa";

export default function SettingsPage() {
    const montserrat = getFontClass("montserrat");
    return (
        <div className="min-h-screen ml-[54px] flex flex-col items-center justify-center gap-6">
            <FaCog className="text-[#FF4E27] w-20 h-20 opacity-40" />
            <h1 className={`${montserrat} text-[#FFD3C9] text-[47px] font-bold`}>Coming Soon....</h1>
            <p className={`${montserrat} text-white/50 text-[18px]`}>Settings are on the way. Stay tuned!</p>
        </div>
    );
}
