import type { Metadata } from "next";

import { AgeConsentProvider } from "@/context/AgeConsentContext";
import { ServiceWorkerContext } from "@/context/ServiceWorkerContext";
import { AuthSessionProvider } from "@/context/AuthSessionContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

import { GoogleTagManager } from "@next/third-parties/google";

import { ThemeProvider } from "next-themes";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mosaic.photography"),
  title: {
    default: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    template: "%s | Vintage Nude Photography by Mosaic",
  },
  alternates: {
    canonical: "https://www.mosaic.photography/",
    languages: {
      es: "https://www.mosaic.photography/es",
      de: "https://www.mosaic.photography/de",
    },
  },
  authors: [
    {
      name: "Mosaic Photography",
      url: "https://www.mosaic.photography/",
    },
  ],
  description:
    "Discover Mosaic's curated gallery of iconic nude photography, celebrating the timeless beauty of the human form through the lens of legendary photographers.",
  keywords: [
    // High-Priority Core Niche (Low KD, Solid Volume)
    "public domain nude photography",
    "public domain Vintage nude photography",
    "public domain art",
    "public domain nudes",
    "nude photography",
    "nude art",
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

type RootLayoutProps = { children: React.ReactNode };

function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-N74Q9JC5" />
      <body>
        <ThemeProvider defaultTheme="dark">
          <ServiceWorkerContext>
            <AuthSessionProvider>
              <AgeConsentProvider>
                <FavoritesProvider>
                  <main style={{ flex: 1 }}>{children}</main>
                  <Analytics />
                  <SpeedInsights />
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
