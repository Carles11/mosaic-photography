import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getGeneralAffiliateResources } from "@/utils/fetchAffiliateDataSSR";
import { fetchPhotographersWithFeaturedSSR } from "@/utils/fetchPhotographersWithFeaturedSSR";
import { fetchGalleryImagesSSR } from "@/utils/fetchGalleryImagesSSR";
import { fetchContributorsWithFeaturedSSR } from "@/utils/fetchContributorsWithFeaturedSSR";
import type { ImageWithOrientation } from "@/types/gallery";

export const metadata: Metadata = {
  title: {
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
    card: "summary_large_image",
    title: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    description:
      "Thousands of copyright-free vintage nude photographs by legendary photographers. All public domain.",
  },
};

function buildHomePageSchema(images: ImageWithOrientation[]) {
  const featured = images.slice(0, 12).map((img) => ({
    "@type": "ImageObject",
    contentUrl:
      img.base_url && img.filename
        ? `${img.base_url}/w600/${img.filename.replace(/\.[^/.]+$/, ".webp")}`
        : (img.url ?? ""),
    name: img.title || "Vintage Photography",
    description:
      img.description || "Public domain vintage photograph from Mosaic Gallery",
    encodingFormat: "image/webp",
    license: "https://creativecommons.org/publicdomain/mark/1.0/",
    acquireLicensePage: "https://www.mosaic.photography/legal/credits",
    ...(img.width && { width: img.width }),
    ...(img.height && { height: img.height }),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Public Domain Vintage Nude Photography | Mosaic Gallery",
    url: "https://www.mosaic.photography",
    description:
      "Browse Mosaic's curated gallery of public domain vintage nude photography.",
    mainEntity: {
      "@type": "ImageGallery",
      name: "Vintage Nude Photography Gallery",
      image: featured,
    },
  };
}

export default async function Page() {
  // All fetches run in parallel for performance
  const [photographers, images, affiliateProducts, contributors] =
    await Promise.all([
      fetchPhotographersWithFeaturedSSR(),
      fetchGalleryImagesSSR(),
      getGeneralAffiliateResources(),
      fetchContributorsWithFeaturedSSR(),
    ]);

  const homePageSchema = buildHomePageSchema(images ?? []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
      />

      <section className="home-titles">
        <h1>
          Vintage Nude Photography Gallery – Public Domain & Copyright-Free Art
        </h1>
        <h2>
          Iconic works by legendary photographers who shaped the history of nude
          art and nude photography.
        </h2>
      </section>

      <Suspense
        fallback={<div className="loading-state">Loading gallery...</div>}
      >
        <HomeClient
          photographers={photographers || []}
          images={images || []}
          affiliateProducts={affiliateProducts || []}
          contributors={contributors || []}
        />
      </Suspense>
    </>
  );
}
