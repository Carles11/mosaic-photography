import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { AppContextProvider } from "@/context/AppContext";
import { ThemeProvider } from "next-themes";
import GitHubCorner from "@/components/buttons/GitHubCorner";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  title: {
    default: "Mosaic | Nude iconic photography",
    template: "%s | Mosaic Photography",
  },
  description:
    "Discover Mosaic's curated gallery of iconic nude photography, celebrating the timeless beauty of the human form through the lens of legendary photographers.",
  keywords: [
    "mosaic",
    "mosaic photography",
    "nude photography",
    "artistic nudes",
    "art nudes",
    "nude pictures",
    "nude photos",
    "classic nudes",
    "vintage photography",
    "historical photography",
    "pictorialism",
    "fine art photography",
    "black and white photography",
    "classic nude photography",
    "early photography",
    "daguerreotype",
    "calotype",
    "wet plate photography",
    "albumen prints",
    "platinum prints",
    "vintage nude photography",
    "19th century photography",
    "Edwardian photography",
    "Victorian photography",
    "Alfred Stieglitz",
    "Baron Wilhelm Von Gloeden",
    "Clarence Hudson White",
    "Edward Weston",
    "Eugene Durieu",
    "Felix Jacques Moulin",
    "Fred Holland Day",
    "Gaudenzio Marconi",
    "Robert Demachy",
    "Wilhelm Von Plueschow",
  ],
  icons: {
    icon: [
      { rel: "icon", url: "/favicons/favicon.ico" },
      {
        rel: "icon",
        url: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: "/favicons/apple-touch-icon.png",
  },
  manifest: "/favicons/site.webmanifest",
  openGraph: {
    title: "Nude photography | Mosaic Photography curated Gallery",
    description:
      "Meet the iconic photographers behind the stunning classic nude photography in our collection.",
    images: ["/favicons/favicon-32x32.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nude photography | Mosaic Photography curated Gallery",
    description:
      "Explore our stunning image gallery featuring classic nude photography by iconic photographers.",
    images: ["/favicons/favicon-32x32.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider defaultTheme="system">
          <AppContextProvider>
            <GitHubCorner url="https://github.com/Carles11/mosaic-photography" />
            <Header />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </AppContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
