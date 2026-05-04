import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DARKFLUX HOTEL - Luxury Redefined",
  description: "Experience luxury redefined at DARKFLUX HOTEL. Book premium rooms, order gourmet food, and enjoy world-class hospitality in the heart of Kathmandu.",
  keywords: ["Darkflux", "Hotel", "Luxury", "Kathmandu", "Nepal", "Booking", "Restaurant"],
  authors: [{ name: "DARKFLUX HOTEL" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              border: '1px solid #2e2e2e',
              color: '#f5f5f5',
            },
          }}
        />
      </body>
    </html>
  );
}
