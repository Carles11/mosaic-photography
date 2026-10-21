import React from "react";
import type { Metadata } from "next";
import AppHero from "@/components/appLanding/AppHero";
import AppScreenshots from "@/components/appLanding/AppScreenshots";
import AppFeatures from "@/components/appLanding/AppFeatures";
import HowItWorks from "@/components/appLanding/HowItWorks";
import QuickWhy from "@/components/appLanding/QuickWhy";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import { serializeJsonLd } from "@/helpers/jsonLd";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/appLinks";
import styles from "./app.module.css";

export const metadata: Metadata = {
  // SEO: title <70 chars, description 50-160 chars
  title: "Mosaic App — Vintage Nude Photography Gallery",
  description:
    "Curated vintage nude photography app. Fast galleries, curated collections, easy downloads. Free on iPhone, iPad & Android.",
  alternates: {
    canonical: "https://www.mosaic.photography/app",
  },
  openGraph: {
    title: "Mosaic App — Vintage Nude Photography Gallery",
    description:
      "Curated vintage nude photography app. Fast galleries, curated collections, easy downloads. Free on iPhone, iPad & Android.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mosaic Photography App",
      },
    ],
    type: "website",
  },
};

export default function AppPage() {
  // Structured data images must be absolute URLs
  const host = "https://www.mosaic.photography";
  type Screenshot = {
    contentUrl: string;
    name: string;
    description: string;
    width: number;
    height: number;
    encodingFormat: string;
  };

  const screenshots: Screenshot[] = [
    {
      contentUrl: `${host}/screenshots/Android-10-inch-tablet/main-gallery-home-tablet-10inch.png`,
      name: "Tablet gallery view",
      description: "Browse curated collections on tablet",
      width: 1200,
      height: 800,
      encodingFormat: "image/png",
    },
    {
      contentUrl: `${host}/screenshots/Apple-iPhone-16-Pro-Max/Apple-iPhone-16-Pro-Max-Screenshot1.png`,
      name: "iPhone photo view",
      description: "High-resolution image viewer with metadata",
      width: 1290,
      height: 2796,
      encodingFormat: "image/png",
    },
    {
      contentUrl: `${host}/screenshots/Android-Samsung-Galaxy-S21-Ultra/Samsung-Galaxy-S21-Ultra-Screenshot1.png`,
      name: "Android search by artist",
      description: "Discover by artist, era, or theme",
      width: 1440,
      height: 3200,
      encodingFormat: "image/png",
    },
  ];

  return (
    <main>
      <header className={styles.hero}>
        <h1 className={styles.headline}>
          Mosaic — Iconic Vintage Nude Photography, Now On Your Phone
        </h1>
      </header>
      <JsonLdSchema
        type="WebPage"
        name="Mosaic App — Iconic Vintage Nude Photography"
        url="https://www.mosaic.photography/app"
        description="Free Mosaic app for iPhone, iPad and Android: public-domain vintage photography from the 1840s to the 1930s."
      />
      <JsonLdSchema
        type="ImageGallery"
        name="Mosaic App Screenshots"
        images={screenshots}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "MobileApplication",
            name: "Mosaic — Vintage Photography",
            operatingSystem: "iOS, iPadOS, Android",
            applicationCategory: "MultimediaApplication",
            url: "https://www.mosaic.photography/app",
            downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      <AppHero />
      <AppScreenshots />
      <AppFeatures />
      <HowItWorks />
      <QuickWhy />

      <div style={{ height: 48 }} />
    </main>
  );
}
