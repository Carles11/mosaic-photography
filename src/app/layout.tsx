import fs from "fs";
import path from "path";
import GlobalNavProvider from "@/components/navigation/BottomNav/GlobalNavProvider";
import type { Metadata } from "next";
import { tradeGothic } from "./fonts";

import { GoogleTagManager } from "@next/third-parties/google";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Toaster } from "react-hot-toast";
import { AgeConsentProvider } from "@/context/AgeConsentContext";
import { ServiceWorkerContext } from "@/context/ServiceWorkerContext";
import { AuthSessionProvider } from "@/context/AuthSessionContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CommentsProvider } from "@/context/CommentsContext";
import NonCriticalCSSLoader from "@/components/NonCriticalCSSLoader";

import "./globals.css";

// Read critical CSS at build time
const criticalCSSPath = path.resolve(
  process.cwd(),
  "src/critical-above-the-fold.css",
);
let criticalCSS = "";
try {
  criticalCSS = fs.readFileSync(criticalCSSPath, "utf8");
} catch (err) {
  console.error("Failed to read critical-above-the-fold.css:", err);
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mosaic.photography"),
  title: {
    default: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    template: "%s | Vintage Nude Photography by Mosaic",
  },
  alternates: {
    canonical: "https://www.mosaic.photography/",
  },
  authors: [
    {
      name: "Mosaic Photography",
      url: "https://www.mosaic.photography/",
    },
  ],
  description:
    "Discover Mosaic's curated gallery of public domain nude photography, celebrating the timeless beauty of the human form through the lens of legendary photographers.",
  keywords: [
    // ... your keywords list as before ...
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
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Nude photography | Mosaic Photography curated Gallery",
    description:
      "Meet the iconic photographers behind the stunning classic nude photography in our collection.",
    images: [
      {
        url: "/images/og-image.jpg", // Create a high-quality OG image
        width: 1200,
        height: 630,
        alt: "Mosaic Photography Gallery featuring vintage nude photography",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nude photography | Mosaic Photography curated Gallery",
    description:
      "Explore our stunning image gallery featuring classic nude photography by iconic photographers.",
    images: ["/images/og-image.jpg"],
    creator: "@mosaicphotography",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

type RootLayoutProps = { children: React.ReactNode };

function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${tradeGothic.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning={true}
    >
      <head>
        <meta charSet="utf-8" />
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <link rel="preconnect" href="https://www.mosaic.photography" />
      </head>
      <GoogleTagManager gtmId="GTM-N74Q9JC5" />
      <body className={`font-trade-gothic`}>
        <NonCriticalCSSLoader />
        <Toaster position="top-center" />
        <ThemeProvider defaultTheme="dark">
          <ServiceWorkerContext>
            <AuthSessionProvider>
              <AgeConsentProvider>
                <FavoritesProvider>
                  <CommentsProvider>
                    <main style={{ flex: 1 }}>{children}</main>
                    <GlobalNavProvider />
                  </CommentsProvider>
                </FavoritesProvider>
              </AgeConsentProvider>
            </AuthSessionProvider>
          </ServiceWorkerContext>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
