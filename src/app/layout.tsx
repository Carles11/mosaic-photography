import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { tradeGothic } from "./fonts";

import Script from "next/script";
import NonCriticalCSSLoader from "@/components/NonCriticalCSSLoader";
import ClientLayout from "@/components/layouts/ClientLayout";
import ClientProviders from "@/context/main/ClientProviders";

// NOTE: globals.css was intentionally removed from static imports to avoid
// Next's automatic CSS extraction which injects render-blocking
// /_next/static/css/*.css links into the head. Global/non-critical styles
// are served from `public/non-critical.css` and loaded non-blocking by
// the client-side `NonCriticalCSSLoader` component. Critical styles are
// inlined below from `src/critical-above-the-fold.css`.

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

// Read minimal base/global variables (do not import as module to avoid
// Next automatic CSS extraction). We inline only the essential parts
// so fonts, CSS variables and base body rules exist at first paint.
const baseCSSPath = path.resolve(process.cwd(), "src/app/globals.css");
let baseCSS = "";
try {
  // We'll keep only the variables and body rules from globals.css
  baseCSS = fs.readFileSync(baseCSSPath, "utf8");
} catch (err) {
  console.error("Failed to read src/app/globals.css:", err);
}

// Inline minimal @font-face declarations so font files are requested
// immediately and do not depend on any deferred CSS chunk. We use
// font-display: swap to avoid blocking text rendering.
const inlineFontsCSS = `@font-face {font-family: 'TradeGothic'; src: url('/fonts/TradeGothic-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap;}@font-face {font-family: 'TradeGothic'; src: url('/fonts/TradeGothic-Bold.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap;}@font-face {font-family: 'TradeGothic'; src: url('/fonts/TradeGothic-Light.woff2') format('woff2'); font-weight: 200; font-style: normal; font-display: swap;}@font-face {font-family: 'TradeGothic'; src: url('/fonts/TradeGothic-ExtraBold.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap;}html,body{font-family:'TradeGothic',var(--font-trade-gothic),sans-serif;} .font-trade-gothic{font-family:'TradeGothic',var(--font-trade-gothic),sans-serif;}`;

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
        {/* Base variables & body rules (inlined) */}
        {/* Inline font-face declarations to ensure fonts are requested early */}
        <style
          id="inline-fonts"
          dangerouslySetInnerHTML={{ __html: inlineFontsCSS }}
        />

        <style id="base-styles" dangerouslySetInnerHTML={{ __html: baseCSS }} />

        {/* Critical above-the-fold styles (inlined) */}
        <style
          id="critical-above-the-fold"
          dangerouslySetInnerHTML={{ __html: criticalCSS }}
        />
        <link rel="preconnect" href="https://www.mosaic.photography" />
      </head>
      {/* <GoogleTagManager gtmId="GTM-N74Q9JC5" /> */}
      <body className={`font-trade-gothic`}>
        <NonCriticalCSSLoader />
        <Script
          id="gtm"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtm.js?id=GTM-N74Q9JC5`}
        />
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
