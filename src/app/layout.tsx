import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import GlobalTranslation from "@/components/GlobalTranslation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://app.soundspire.online";

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "SoundSpire — The Superfan Experience",
        template: "%s | SoundSpire",
    },
    description:
        "SoundSpire connects fans directly with their favorite artists through exclusive communities, reviews, and personalized music discovery.",
    keywords: [
        "music",
        "artist community",
        "superfans",
        "music discovery",
        "artist platform",
        "music reviews",
    ],
    alternates: { canonical: "/" },
    icons: {
        icon: "/api/images/assets/ss_logo.png",
    },
    openGraph: {
        type: "website",
        siteName: "SoundSpire",
        title: "SoundSpire — The Superfan Experience",
        description:
            "Connect directly with your favorite artists, access exclusive releases, and join a community that shares your passion.",
        url: BASE_URL,
        images: ["/api/images/assets/index.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "SoundSpire — The Superfan Experience",
        description:
            "Connect directly with your favorite artists, access exclusive releases, and join a community that shares your passion.",
        images: ["/api/images/assets/index.png"],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`antialiased min-h-screen bg-[#1a1625]`}>
                <LanguageProvider>
                    <AuthProvider>
                        <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 5000 }} />
                        <GlobalTranslation>
                            {children}
                        </GlobalTranslation>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
