import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { fetchPhotographersWithFeaturedSSR } from "@/utils/fetchPhotographersWithFeaturedSSR";
import { fetchGalleryImagesSSR } from "@/utils/fetchGalleryImagesSSR";
import type { ImageWithOrientation } from "@/types/gallery";

export const metadata: Metadata = {
  title: {
    // `absolute` bypasses the root layout template so the homepage title
    // is not double-suffixed.
    absolute: "Public Domain Vintage Nude Photography | Mosaic Gallery",
  },
  description:
    "Browse Mosaic's curated gallery of public domain vintage nude photography by legendary photographers. Discover biographies, historical timelines, and thousands of copyright-free images.",
  openGraph: {
    title: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    description:
      "Discover legendary photographers and their iconic public domain works. Biographies, timelines, and thousands of vintage nude photographs – all copyright-free.",
  },
  twitter: {
    title: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    description:
      "Thousands of copyright-free vintage nude photographs by legendary photographers. All public domain.",
  },
};

function buildHomePageSchema(images: ImageWithOrientation[]) {
  const featured = images.slice(0, 12).map((img) => {
    const filename = img.filename ?? "";
    const webpFilename = filename.replace(/\.[^/.]+$/, ".webp");
    const contentUrl = img.base_url
      ? `${img.base_url}/w600/${webpFilename}`
      : (img.url ?? "");
    return {
      "@type": "ImageObject",
      contentUrl,
      name: img.title || "Vintage Photography",
      description:
        img.description ||
        "Public domain vintage photograph from Mosaic Gallery",
      encodingFormat: "image/webp",
      license: "https://creativecommons.org/publicdomain/mark/1.0/",
      acquireLicensePage: "https://www.mosaic.photography/legal/credits",
      ...(img.width ? { width: img.width } : {}),
      ...(img.height ? { height: img.height } : {}),
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    url: "https://www.mosaic.photography",
    description:
      "Browse Mosaic's curated gallery of public domain vintage nude photography by legendary photographers. Biographies, historical timelines, and thousands of copyright-free images.",
    mainEntity: {
      "@type": "ImageGallery",
      name: "Vintage Nude Photography Gallery",
      description:
        "A curated gallery of classic and vintage nude photographs in the public domain (CC PDM 1.0)",
      image: featured,
    },
  };
}

export default async function HomePage() {
  const [photographers, images] = await Promise.all([
    fetchPhotographersWithFeaturedSSR(),
    fetchGalleryImagesSSR(),
  ]);

  const homePageSchema = buildHomePageSchema(images ?? []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
      />
      <Suspense fallback={<div>Loading.....</div>}>
        <HomeClient photographers={photographers || []} images={images || []} />
      </Suspense>
    </>
  );
}
