import { notFound } from "next/navigation";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import { fetchPhotographerBySlugSSR } from "@/utils/fetchPhotographerByIdSSR";
import { PhotographerLinks } from "../client/PhotographerLinks";
import Timeline from "@/components/timeline/Timeline";
import { getTimelineBySlug } from "@/lib/timeline/photographersTimelines";
import { TimelineItemModelProps } from "@/types/components";
import { formatLifespan } from "@/helpers/dates";
import type { Photographer } from "@/types/gallery";

import styles from "./Photographers.module.css";

// Helper: generate SEO metadata for each photographer page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ surname: string }>;
}) {
  const { surname: urlSurname } = await params;
  const photographer = await fetchPhotographerBySlugSSR(urlSurname);
  if (!photographer) return {};

  // Prefer the best image for og and twitter. Fallback to gallery og-image if missing.
  const ogImageUrl =
    photographer.images?.[0]?.s3Progressive?.find((img) => img.width >= 800)
      ?.url ||
    photographer.images?.[0]?.s3Progressive?.[0]?.url ||
    "https://www.mosaic.photography/images/og-image.jpg";

  const name = photographer.name ?? "";
  const surname = photographer.surname ?? "";
  const origin = photographer.origin ?? "";
  const galleryCount = photographer.images?.length ?? 0;
  const canonicalUrl = `https://www.mosaic.photography/photographers/${urlSurname}`;

  return {
    title: `${name} ${surname} – Vintage Nude Photography | Mosaic Gallery`,
    description: `Discover the vintage nude photography of ${name} ${surname} (${origin}), legendary in public domain art. View biography, gallery (${galleryCount} images), and historical milestones at Mosaic Photography.`,
    keywords: [
      "vintage nude photography",
      "public domain",
      "classic nude art",
      "gallery",
      "iconic photographers",
      name,
      surname,
      "Mosaic Gallery",
      origin,
    ],
    openGraph: {
      title: `${name} ${surname} – Vintage Nude Photography | Mosaic Gallery`,
      description: `Explore ${name} ${surname}'s biography, public domain nude photography, and curated gallery. Discover classic art and historical milestones.`,
      type: "profile",
      url: canonicalUrl,
      images: [ogImageUrl],
      profile: {
        firstName: name,
        lastName: surname,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} ${surname} – Vintage Nude Photography | Mosaic Gallery`,
      description: `Explore the vintage nude photography and biography of ${name} ${surname}, legendary public domain artist. View gallery (${galleryCount} images) at Mosaic Photography.`,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    authors: [
      {
        name: `${name} ${surname}`,
        url: photographer.website || canonicalUrl,
      },
    ],
  };
}

type PhotographerJsonLdProps = {
  photographer: Photographer;
  canonicalUrl: string;
  ogImageUrl: string;
};

function PhotographerJsonLd({
  photographer,
  canonicalUrl,
  ogImageUrl,
}: PhotographerJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: `${photographer.name} ${photographer.surname}`,
          url: canonicalUrl,
          description: photographer.biography,
          image: ogImageUrl,
          sameAs: [photographer.website].concat(
            Array.isArray(photographer.store)
              ? (photographer.store as { website?: string }[])
                  .map((s) => s.website)
                  .filter(Boolean)
              : []
          ),
        }),
      }}
    />
  );
}

export default async function PhotographerDetailPage({
  params,
}: {
  params: Promise<{ surname: string }>;
}) {
  const { surname } = await params;

  if (!surname) return notFound();

  const cleanSurname = surname.replace(/-/g, "");
  const photographerTimeline = getTimelineBySlug(cleanSurname);
  const photographer = await fetchPhotographerBySlugSSR(surname);
  if (!photographer) return notFound();

  const imagesWithUrl = (photographer.images ?? []).map((img) => ({
    ...img,
    url: img.s3Progressive?.[0]?.url ?? "/favicons/android-chrome-512x512.png",
  }));

  // For JSON-LD
  const ogImageUrl =
    photographer.images?.[0]?.s3Progressive?.find((img) => img.width >= 800)
      ?.url ||
    photographer.images?.[0]?.s3Progressive?.[0]?.url ||
    "https://www.mosaic.photography/images/og-image.jpg";
  const canonicalUrl = `https://www.mosaic.photography/photographers/${surname}`;

  return (
    <div>
      <PhotographerJsonLd
        photographer={photographer}
        canonicalUrl={canonicalUrl}
        ogImageUrl={ogImageUrl}
      />
      <main className={styles.photographerDetailPage}>
        <h1 className={styles.photographerDetailPageTitle}>
          {photographer.name} {photographer.surname}
        </h1>
        <p className={styles.sectionContent}>
          {formatLifespan(
            photographer.birthdate ?? "",
            photographer.deceasedate ?? ""
          )}
        </p>
        <hr />
        <h2 className={styles.timelineTitle}>A Life in Focus</h2>
        <p className={styles.sectionContent}>
          Personal & Historical Milestones in {photographer.name}{" "}
          {photographer.surname}&apos;s life time.
        </p>
        <div className={styles.timelineContainer}>
          <Timeline events={photographerTimeline as TimelineItemModelProps[]} />
        </div>
        <h2 className={styles.timelineTitle}>About the Photographer</h2>
        <span className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Born in: </h3>
          <p className={styles.sectionContent}>{photographer.origin}</p>
        </span>
        <span className={styles.subsectionHeader}>
          <h3 className={styles.sectionTitle}>Biography:</h3>
          <p className={styles.sectionBioContent}>{photographer.biography}</p>
        </span>
        <PhotographerLinks
          stores={photographer.store}
          website={photographer.website}
        />
      </main>
      <h2 className={styles.timelineTitle}>
        Gallery{" "}
        <span
          className={styles.galleryCount}
        >{`(${imagesWithUrl.length})`}</span>
      </h2>
      <PhotographerGalleryZoom images={imagesWithUrl} />
    </div>
  );
}
