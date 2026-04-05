"use client";

interface TranslatableTextProps {
    text: string;
    className?: string;
    truncate?: number;
}

export default function TranslatableText({ text, className, truncate }: TranslatableTextProps) {
    const rendered = truncate && text.length > truncate
        ? text.slice(0, truncate) + "..."
        : text;
    return <p className={className}>{rendered}</p>;
}
