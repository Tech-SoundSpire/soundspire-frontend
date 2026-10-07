"use client";
import { useState } from "react";

// Copies the given text; falls back to telling the user to select it manually.
export default function CopyButton({ text }: { text: string }) {
    const [label, setLabel] = useState("Copy");
    const flash = (l: string) => { setLabel(l); setTimeout(() => setLabel("Copy"), 1600); };
    return (
        <button
            type="button"
            className="copybtn"
            onClick={() => navigator.clipboard?.writeText(text).then(() => flash("Copied"), () => flash("Select manually")) ?? flash("Select manually")}
        >
            {label}
        </button>
    );
}
