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
        <style
          id="inline-fonts"
          dangerouslySetInnerHTML={{ __html: inlineFontsCSS }}
        />
        <style id="base-styles" dangerouslySetInnerHTML={{ __html: baseCSS }} />
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
      </head>
      <body className="font-trade-gothic">
        <NonCriticalCSSLoader />
        <CookieConsentBanner />
        <ClientProviders>
          <main style={{ flex: 1 }}>
            <ClientLayout>{children}</ClientLayout>
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}

export default RootLayout;
