/**
 * Main App Layout
 * - Loads GTM only if cookie_consent is true
 * - Shows CookieConsentBanner if consent not given
 * - FSD: place GTMManual in the same file or import from 4-shared/lib if you prefer
 */

import type { Metadata } from "next";
import { tradeGothic } from "./fonts";
import criticalCSS from "../critical-above-the-fold.css?raw";
import baseCSS from "./globals.css?raw";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import NonCriticalCSSLoader from "@/components/NonCriticalCSSLoader";
import ClientLayout from "@/components/layouts/ClientLayout";
import ClientProviders from "@/context/main/ClientProviders";
import CookieConsentBanner from "@/components/cookieConsent/CookieConsentBanner";
import GTMManual from "../GTMManual";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

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
      name: "Carles del Río Francés",
      url: "https://www.rio-frances.com/",
    },
  ],
  description:
    "Discover Mosaic's curated gallery of public domain nude photography, celebrating the timeless beauty of the human form through the lens of legendary photographers.",
  keywords: [
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
    "collectors of vintage nude art",
    "fine art nude enthusiasts",
    "photography history lovers",
    "academic nude photo resources",
    "iconic nude photographer archive",
    "inspiration for artists nude poses",
    "free vintage nude photo downloads",
    "order vintage nude prints online",
    "purchase classic nude art",
    "printable vintage nudes",
    "license free nude images",
    "royalty-free vintage nude photos",
    "high-resolution nude art download",
    "film nude photography",
    "soft focus nude portraits",
    "hand-tinted nude photographs",
    "glass plate nude negatives",
    "pictorialist nude photography",
    "natural light nude photography",
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
        url: "/images/og-image.jpg",
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

const inlineFontsCSS = `@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap;}
@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap;}
@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-Light.woff2') format('woff2'); font-weight: 200; font-style: normal; font-display: swap;}
@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-ExtraBold.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap;}
html,body{font-family:'TradeGothic',var(--font-trade-gothic),sans-serif;} .font-trade-gothic{font-family:'TradeGothic',var(--font-trade-gothic),sans-serif;}`;

type RootLayoutProps = { children: React.ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cookie = Cookies.get("cookie_consent");
      setConsent(cookie === "true");
    }
  }, []);

  return (
    <html
      lang="en"
      className={tradeGothic.variable + " light"}
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning={true}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <style
          id="inline-fonts"
          dangerouslySetInnerHTML={{ __html: inlineFontsCSS }}
        />
        <style id="base-styles" dangerouslySetInnerHTML={{ __html: baseCSS }} />
        <style
          id="critical-above-the-fold"
          dangerouslySetInnerHTML={{ __html: criticalCSS }}
        />
        <JsonLdSchema
          type="WebSite"
          name="Mosaic Photography"
          url="https://www.mosaic.photography"
          description="Discover Mosaic's curated gallery of public domain nude photography, celebrating the timeless beauty of the human form through the lens of legendary photographers."
          publisher={{
            name: "Mosaic Photography",
            url: "https://www.mosaic.photography",
            logo: "https://www.mosaic.photography/images/logo.png",
          }}
        />
        {consent === true && <GTMManual consentGranted={true} />}
      </head>
      <body className="font-trade-gothic">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N74Q9JC5"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {consent !== true && (
          <CookieConsentBanner onConsentChange={setConsent} />
        )}
        <NonCriticalCSSLoader />
        <ClientProviders>
          <main style={{ flex: 1 }}>
            <ClientLayout>{children}</ClientLayout>
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
