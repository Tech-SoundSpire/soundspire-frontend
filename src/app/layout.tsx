import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

import { fonts } from "@/utils/getFontClass";

export const metadata: Metadata = {
    title: "SoundSpire",
    description: "The Superfandom platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${fonts.inter.variable}`}>
            <body className={`antialiased min-h-screen bg-[#1a1625]`}>
                <AuthProvider>
                    <Toaster position="top-center" reverseOrder={false} />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
