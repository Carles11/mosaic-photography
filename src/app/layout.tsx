import type { Metadata } from "next";
import { tradeGothic } from "./fonts";
import { headers } from "next/headers";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import Script from "next/script";
import NonCriticalCSSLoader from "@/components/NonCriticalCSSLoader";
import ClientLayout from "@/components/layouts/ClientLayout";
import ClientProviders from "@/context/main/ClientProviders";
import criticalCSS from "../critical-above-the-fold.css?raw";
import baseCSS from "./globals.css?raw";
import CookieConsentBanner from "@/components/cookieConsent/CookieConsentBanner";

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
  keywords: [
    // ... (your full keyword list here, unchanged)
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

type RootLayoutProps = { children: React.ReactNode };

async function RootLayout({ children }: RootLayoutProps) {
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
        {/* Inline font-face declarations to ensure fonts are requested early */}
        <style
          id="inline-fonts"
          dangerouslySetInnerHTML={{ __html: inlineFontsCSS }}
        />
        {/* Base variables & body rules (inlined) */}
        <style id="base-styles" dangerouslySetInnerHTML={{ __html: baseCSS }} />
        {/* Critical above-the-fold styles (inlined) */}
        <style
          id="critical-above-the-fold"
          dangerouslySetInnerHTML={{
            __html: criticalCSS,
          }}
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
            logo: "https://www.mosaic.photography/images/logo.png",
          }}
        />
      </head>
      <body className="font-trade-gothic">
        <NonCriticalCSSLoader />
        {/* Only load GTM if cookie_consent is true */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function loadGTM() {
                  var consent = document.cookie.match(/(^|;)\\s*cookie_consent=([^;]*)/);
                  if (consent && consent[2] === "true") {
                    var s = document.createElement('script');
                    s.src = "https://www.googletagmanager.com/gtm.js?id=GTM-N74Q9JC5";
                    s.async = true;
                    document.head.appendChild(s);
                  }
                }
                loadGTM();
                window.addEventListener("cookie-consent-granted", loadGTM);
              })();
            `,
          }}
        />
        <CookieConsentBanner />
        <ClientProviders>
          <main style={{ flex: 1 }}>
            <ClientLayout>{children}</ClientLayout>
          </main>
        </ClientProviders>
        {/* Client-side lazy ModalProvider is mounted above so it can render into #modal-root */}
      </body>
    </html>
  );
}

export default RootLayout;
