import React from "react";
import type { Metadata } from "next";
import { tradeGothic } from "./fonts";
import { headers } from "next/headers";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import NonCriticalCSSLoader from "@/components/NonCriticalCSSLoader";
import ClientLayout from "@/components/layouts/ClientLayout";
import ClientProviders from "@/context/main/ClientProviders";
import AnalyticsLoader from "@/components/cookieConsent/analytics/AnalyticsLoader";
import criticalCSS from "../critical-above-the-fold.css?raw";
import baseCSS from "./globals.css?raw";

// Inline minimal @font-face declarations for early font loading from AWS CDN
const inlineFontsCSS = `@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap;}
@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap;}
@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-Light.woff2') format('woff2'); font-weight: 200; font-style: normal; font-display: swap;}
@font-face {font-family: 'TradeGothic'; src: url('https://cdn.mosaic.photography/fonts/TradeGothic-ExtraBold.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap;}
html,body{font-family:'TradeGothic',var(--font-trade-gothic),sans-serif;} .font-trade-gothic{font-family:'TradeGothic',var(--font-trade-gothic),sans-serif;}`;

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

type RootLayoutProps = { children: React.ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  // SSR theme from x-theme header (set in middleware)
  const hdrs = await headers();
  const theme = hdrs.get("x-theme") || "light";

  return (
    <html
      lang="en"
      className={`${tradeGothic.variable} ${theme}`}
      data-theme={theme}
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
        <link
          rel="preload"
          href="https://cdn.mosaic.photography/fonts/TradeGothic-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdn.mosaic.photography/fonts/TradeGothic-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.mosaic.photography"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://gdzqgrfitiixbhlhppef.supabase.co"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://cdn.mosaic.photography" />
        <link
          rel="dns-prefetch"
          href="https://gdzqgrfitiixbhlhppef.supabase.co"
        />
        <JsonLdSchema
          type="WebSite"
          name="Mosaic Photography"
          url="https://www.mosaic.photography"
          description="Discover Mosaic's curated gallery of public domain nude photography, celebrating the timeless beauty of the human form through the lens of legendary photographers."
          publisher={{
            name: "Mosaic Photography",
            url: "https://www.mosaic.photography",
            logo: "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Mosaic Photography",
              url: "https://www.mosaic.photography",
              logo: "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp",
              description:
                "Mosaic Photography is a curated gallery of public domain vintage nude photography, celebrating the timeless artistry of legendary photographers.",
              sameAs: [
                "https://www.instagram.com/mosaic.photography.gallery",
                "https://www.facebook.com/mosaic.photography.gallery",
                "https://github.com/Carles11",
                "https://apps.apple.com/us/app/iconic-photography-gallery/id6755329136",
                "https://play.google.com/store/apps/details?id=com.carlos_delrio.mosaicphotographyapp",
              ],
            }),
          }}
        />
        {/* GTM and Clarity are now loaded client-side only via AnalyticsLoader when consent is granted */}
        <meta
          name="impact-site-verification"
          content="8a120ba2-3dc3-4135-ac06-990388022693"
        />
        {/* YANDEX */}
        <meta name="yandex-verification" content="4d7b85a7f1cd21b8" />
      </head>
      <body className="font-trade-gothic">
        <NonCriticalCSSLoader />
        <ClientProviders>
          <AnalyticsLoader />
          <main style={{ flex: 1 }}>
            <ClientLayout>{children}</ClientLayout>
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
