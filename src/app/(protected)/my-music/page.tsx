"use client";
import { getFontClass } from "@/utils/getFontClass";
import { FaMusic } from "react-icons/fa";

export default function MyMusicPage() {
    const montserrat = getFontClass("montserrat");
    return (
        <div className="min-h-screen ml-[54px] flex flex-col items-center justify-center gap-6">
            <FaMusic className="text-[#FF4E27] w-20 h-20 opacity-40" />
            <h1 className={`${montserrat} text-[#FFD3C9] text-[47px] font-bold`}>Coming Soon....</h1>
            <p className={`${montserrat} text-white/50 text-[18px]`}>We&apos;re working on something amazing. Stay tuned!</p>
        </div>
    );
}
