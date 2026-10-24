import { Suspense } from "react";
import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import {
  getGeneralAffiliateResources,
  getPhotographerCardLinks,
} from "@/utils/fetchAffiliateDataSSR";
import { fetchPhotographersWithFeaturedSSR } from "@/utils/fetchPhotographersWithFeaturedSSR";
import { fetchGalleryImagesSSR } from "@/utils/fetchGalleryImagesSSR";
import { fetchContributorsWithFeaturedSSR } from "@/utils/fetchContributorsWithFeaturedSSR";
import { serializeJsonLd } from "@/helpers/jsonLd";
import type {
  HomeGalleryImage,
  HomePhotographer,
  ImageWithOrientation,
  Photographer,
} from "@/types/gallery";

// Every field here is serialized into the homepage HTML (RSC payload), so send
// only what the client reads. `url` duplicates base_url + filename; created_at,
// biographies, website and instagram are never read on the homepage.
function toHomeImage(img: ImageWithOrientation): HomeGalleryImage {
  return {
    id: img.id,
    base_url: img.base_url,
    filename: img.filename,
    author: img.author,
    title: img.title,
    description: img.description,
    orientation: img.orientation,
    width: img.width,
    height: img.height,
    print_quality: img.print_quality,
    gender: img.gender,
    color: img.color,
    nudity: img.nudity,
    year: img.year,
    mosaicType: img.mosaicType,
    exclude_from_index: (img as ImageWithOrientation).exclude_from_index,
  };
}

function toHomePhotographer(p: Photographer): HomePhotographer {
  return {
    id: p.id,
    name: p.name,
    surname: p.surname,
    author: p.author,
    slug: p.slug,
    birthdate: p.birthdate,
    deceasedate: p.deceasedate,
    origin: p.origin,
    intro_md: p.intro_md,
    images: p.images,
    cardLinks: p.cardLinks,
  };
}

export const metadata: Metadata = {
  title: {
    absolute: "Public Domain Vintage Nude Photography | Mosaic Gallery",
  },
  description:
    "Public domain vintage nude photography by legendary photographers, with biographies, timelines and over 1,000 copyright-free fine-art images.",
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
  alternates: { canonical: "/" },
};

function buildHomePageSchema(images: ImageWithOrientation[]) {
  const filtered = (images || []).filter(
    (img) => img.exclude_from_index !== true,
  );
  const featured = filtered.slice(0, 12).map((img) => ({
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
  const [
    photographersRaw,
    images,
    affiliateProducts,
    contributors,
    cardLinksByAuthor,
  ] = await Promise.all([
    fetchPhotographersWithFeaturedSSR(),
    fetchGalleryImagesSSR(),
    getGeneralAffiliateResources(),
    fetchContributorsWithFeaturedSSR(),
    getPhotographerCardLinks(),
  ]);

  // Attach each photographer's paid links here rather than threading a second
  // prop through four components. The card renders whatever is on cardLinks
  // and knows nothing about advertisers.
  const photographers =
    photographersRaw?.map((photographer) =>
      toHomePhotographer({
        ...photographer,
        cardLinks: cardLinksByAuthor[photographer.author] ?? [],
      }),
    ) ?? null;

  const homePageSchema = buildHomePageSchema(images ?? []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(homePageSchema) }}
      />

      {/* The page's single H1 lives in HeroSection (above the fold, inside
          the header's hero). This section carries only the H2. */}
      <section className="home-titles">
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
          images={images?.map(toHomeImage) ?? []}
          affiliateProducts={affiliateProducts || []}
          contributors={contributors || []}
        />
      </Suspense>
    </>
  );
}
