import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aoife — Borrow & Carry",
  description: "Learn column subtraction and addition — borrowing, carrying, and missing digits.",
  // Home Screen install — see app/manifest.ts (installed web apps keep localStorage).
  applicationName: "Borrow & Carry",
  appleWebApp: { capable: true, title: "Borrow & Carry", statusBarStyle: "default" },
  other: { "apple-mobile-web-app-capable": "yes" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
