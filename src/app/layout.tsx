import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

import { AppContextProvider } from "@/context/AppContext";
import { AgeConsentProvider } from "@/context/AgeConsentContext";
import { ServiceWorkerContext } from "@/context/ServiceWorkerContext";

import { ThemeProvider } from "next-themes";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mosaic.photography"),
  title: {
    default: "Public Domain Nude Photography | Mosaic Gallery",
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
    "nude photography",
    "vintage nude photography ",
    "vintage nude photography public domain",
    "fine art nude photography public domain",
    "classic nude photography ",
    "artistic nudes public domain",
    "vintage nude portraits public domain",
    "archival nude photographs public domain",
    "nude portraiture public domain",
    "black and white nude photography",
    "figure study nude photography public domain",
    "sepia nude photography public domain",
    "museum nude photography collection",
    "daguerreotype nude photography",
    "wet plate nude portraits",
    "platinum print nude photos",
    "bodyscape nude art public domain",
    "sculptural lighting nude photography",
    "contrapposto pose nude art",
    "nude photography from the 1900s",
    "gallery of vintage nude photographs",

    // Artist-Specific (Supports Long-Tail, Historical Interest)
    "Edward Weston nude photography",
    "Alfred Stieglitz public domain nudes",
    "Baron Wilhelm von Gloeden nude photos",
    "Fred Holland Day photography public domain",
    "Eadweard Muybridge vintage nude studies",
    "Robert Demachy nude photography archive",

    // Commercial/Intent-Driven (Conversion-Focused Terms)
    "download vintage nude photos",
    "buy vintage nude photography prints",
    "high resolution vintage nude scans",
    "HD nude photography vintage public domain",
    "timeless nude art photo collection",

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
      {/* <head>
        <Script id="preload-images" strategy="beforeInteractive">
          {`
            const link1 = document.createElement('link');
            link1.rel = 'preload';
            link1.as = 'image';
            link1.href = 'https://res.cloudinary.com/dktizqbky/image/upload/v1745436165/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-mobile-light_500x353px_v6gwqg.webp';
            document.head.appendChild(link1);

            const link2 = document.createElement('link');
            link2.rel = 'preload';
            link2.as = 'image';
            link2.href = 'https://res.cloudinary.com/dktizqbky/image/upload/v1745436069/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-mobile-DARK_500x353px_szzmkn.webp';
            document.head.appendChild(link2);
          `}
        </Script>
      </head> */}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider defaultTheme="dark">
          <AppContextProvider>
            <AgeConsentProvider>
              <ServiceWorkerContext>
                <main style={{ flex: 1 }}>{children}</main>
                <Analytics />
                <SpeedInsights />
              </ServiceWorkerContext>
            </AgeConsentProvider>
          </AppContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default RootLayout;
