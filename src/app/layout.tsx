import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
    <html lang="en" className="h-full">
      <body className={`${inter.variable} antialiased min-h-screen bg-black`}>
        {/* <AuthProvider> */}
        <Toaster position="top-center" reverseOrder={false} />
        {children}
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
