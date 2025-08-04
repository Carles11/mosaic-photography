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

// Critical CSS for above-the-fold content
const criticalCSS = `
  @font-face{font-family:"Trade Gothic";src:url("/fonts/TradeGothic-Regular.ttf") format("truetype");font-weight:400;font-style:normal;font-display:swap}
  @font-face{font-family:"Trade Gothic";src:url("/fonts/TradeGothic-Light.ttf") format("truetype");font-weight:200;font-style:normal;font-display:swap}
  @font-face{font-family:"Trade Gothic";src:url("/fonts/TradeGothic-Bold.ttf") format("truetype");font-weight:700;font-style:normal;font-display:swap}
  @font-face{font-family:"Trade Gothic";src:url("/fonts/TradeGothic-ExtraBold.ttf") format("truetype");font-weight:800;font-style:normal;font-display:swap}
  html,body{height:100%;scroll-behavior:smooth}
  :root{display:flex;flex-direction:column;min-height:100vh;--background-color: #fff;--text-color: #1d1d1d;--secondary-color: #cccaca;--tertiary-color: #fd6c6c;--text-gradient: linear-gradient(135deg, #4cf6c3 30%, #1faef0 70%);--color-white: #fff;--color-black: #1d1d1d;--link-color: rgb(107, 154, 192)}
  body{display:flex;flex-direction:column;min-height:100vh;margin:0}
  body{position:relative;height:100%;font-family:"Trade Gothic",sans-serif;font-weight:400;margin:0;padding:0;box-sizing:border-box;background-color:var(--background-color);color:var(--text-color)}
  @media (prefers-color-scheme:dark){:root{background-color:var(--background-color);color:var(--text-color)}}
`;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mosaic.photography"),
  title: {
    default: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    template: "%s | Vintage Nude Photography by Mosaic",
  },
  alternates: {
    canonical: "https://www.mosaic.photography/",
    // languages: {
    //   es: "https://www.mosaic.photography/es",
    //   de: "https://www.mosaic.photography/de",
    // },
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
    // High-Priority Core Niche (Low KD, Solid Volume)
    "public domain nude photography",
    "public domain Vintage nude photography",
    "public domain art",
    "public domain nudes",
    "nude photography",
    "vintage nudes",
    "nude art",
    "free images art",
    "free art",
    "vintage nude photography ",
    "vintage nude photography public domain",
    "vintage art photography",
    "classic nude art",
    "retro nude photography",
    "historical nude photos",
    "old photography gallery",
    "antique nude images",
    "artistic nude photo archive",
    "museum quality nude prints",
    "curated nude art gallery",
    "rare nude photography",
    "public domain nude art",
    "timeless nude art gallery",
    "public domain",
    "copyright-free",
    "royalty-free",
    "free use images",
    "commercial use",
    "free to use photography",
    "open access photography",
    "no copyright photography",
    "unrestricted use images",
    "free stock photos",
    "non-copyrighted",
    "creative commons zero",
    "CC0 images",
    "open license",
    "free distribution images",
    "free for personal and commercial use",
    "free art images",
    "out of copyright images",
    "free cultural works",
    "commons images",
    "public domain art",

    // Photographer/Artist-Specific
    "Edward Weston ",
    "Baron Wilhelm von Gloeden ",
    "Fred Holland Day",
    "Eadweard Muybridge ",
    "Alfred Stieglitz",
    "Robert Demachy",
    "Gaudenzio Marconi",
    "Eugene Durieu",
    "Felix Jacques Moulin",
    "Wilhelm von Plüschow",
    "Clarence Hudson White",

    // Audience/Interest-Based
    "collectors of vintage nude art",
    "fine art nude enthusiasts",
    "photography history lovers",
    "academic nude photo resources",
    "iconic nude photographer archive",
    "inspiration for artists nude poses",

    // Commercial/Intent
    "free vintage nude photo downloads",
    "order vintage nude prints online",
    "purchase classic nude art",
    "printable vintage nudes",
    "license free nude images",
    "royalty-free vintage nude photos",
    "high-resolution nude art download",

    // Technique/Style
    "film nude photography",
    "soft focus nude portraits",
    "hand-tinted nude photographs",
    "glass plate nude negatives",
    "pictorialist nude photography",
    "natural light nude photography",

    // German Keywords (Localized SEO)
    "Akt foto",
    "Aktfotografie",
    "klassische Aktfotografie ",
    "Vintage Aktfotografie ",
    "ästhetische Aktfotos gemeinfrei",
    "Aktfotografie Schwarzweiß gemeinfrei",
    "historische Aktfotografie ",
    "Platinprint Aktfotografie gemeinfrei",
    "zeitlose Aktfotografie gemeinfrei",
    "Galerie-Aktfotografie gemeinfrei",
    "Körperstudie Fotografie gemeinfrei",

    // Spanish Keywords (Localized SEO)
    "fotografía artística de desnudos dominio público",
    "fotografía de desnudos clásico dominio público",
    "fotografía vintage de desnudos dominio público",
    "retratos de desnudos en dominio público",
    "galería de desnudos vintage dominio público",
    "daguerrotipos desnudos dominio público",
    "colección de desnudos históricos dominio público",
    "descargar fotos de desnudos vintage dominio público",
    "impresiones artísticas de desnudos dominio público",
    "escaneo de fotos desnudas vintage en alta calidad",
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
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <noscript>
          <link rel="stylesheet" href="/non-critical.css" />
        </noscript>

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
