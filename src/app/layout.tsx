import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Astrology Calculator - Spark & True Placement",
  description: "Discover your Spark, True Placement, and Profection Years with our cosmic astrology calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${cormorant.variable}`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
