import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import GlobalTranslation from "@/components/GlobalTranslation";

export const metadata: Metadata = {
    title: "SoundSpire",
    description: "The Superfandom platform",
    icons: {
        icon: "/api/images/assets/ss_logo.png",
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
