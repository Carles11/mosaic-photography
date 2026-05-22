import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import {
  fetchPhotographerBySlugSSR,
  fetchAllPhotographerSlugsSSR,
} from "@/utils/fetchPhotographerByIdSSR";
import { PhotographerLinks } from "../client/PhotographerLinks";
import Timeline from "@/components/timeline/Timeline";
import { getTimelineBySlug } from "@/lib/timeline/photographersTimelines";
import { TimelineItemModelProps } from "@/types/components";
import { formatLifespan } from "@/helpers/dates";
import type { Photographer } from "@/types/gallery";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import styles from "./Photographers.module.css";
import { getHumanReadableBiography } from "@/utils/clean-content";

// Revalidate all pre-built photographer pages every 24 hours (ISR)
export const revalidate = 86400;

// Pre-generate all known photographer slugs at build time
export async function generateStaticParams() {
  const slugs = await fetchAllPhotographerSlugsSSR();
  return slugs.map((surname) => ({ surname }));
}

// Helper: generate SEO metadata for each photographer page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ surname: string }>;
}) {
  const { surname: urlSurname } = await params;
  const photographer = await fetchPhotographerBySlugSSR(urlSurname);
  if (!photographer) return {};

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

  // Short SEO title: always <70 chars
  const seoTitle = `${name} ${surname} – Mosaic Gallery`.slice(0, 68);

  // Meta description: always 50-160 chars
  let desc = `Discover the vintage nude photography of ${name} ${surname} (${origin}), legendary in public domain art. View biography, gallery (${galleryCount} images), and historical milestones at Mosaic Photography.`;
  if (desc.length > 160) desc = desc.slice(0, 157) + "...";
  if (desc.length < 50)
    desc = `Discover vintage nude photography, biography, and gallery at Mosaic Gallery.`;

  return {
    title: seoTitle,
    description: desc,
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
      title: seoTitle,
      description: desc,
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
      title: seoTitle,
      description: desc,
      images: [ogImageUrl],
    },
    alternatives: {
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
          description:
            photographer.biography_md || photographer.biography || "",
          image: ogImageUrl,
          jobTitle: "Photographer",
          ...(photographer.birthdate && { birthDate: photographer.birthdate }),
          ...(photographer.deceasedate && {
            deathDate: photographer.deceasedate,
          }),
          ...(photographer.origin && { nationality: photographer.origin }),
          sameAs: [photographer.website].concat(
            Array.isArray(photographer.store)
              ? (photographer.store as { website?: string }[])
                  .map((s) => s.website)
                  .filter(Boolean)
              : [],
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

  const gallerySchemaImages = imagesWithUrl.map((img) => ({
    contentUrl: img.url,
    name:
      img.title || `${photographer.name} ${photographer.surname} Photograph`,
    description: img.description || "Vintage photography from Mosaic Gallery",
    width: img.width || "1600",
    height: img.height || "auto",
    encodingFormat: "image/webp",
  }));

  const ogImageUrl =
    photographer.images?.[0]?.s3Progressive?.find((img) => img.width >= 800)
      ?.url ||
    photographer.images?.[0]?.s3Progressive?.[0]?.url ||
    "https://www.mosaic.photography/images/og-image.jpg";
  const canonicalUrl = `https://www.mosaic.photography/photographers/${surname}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.mosaic.photography/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Photographers",
        item: "https://www.mosaic.photography/photographers",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${photographer.name} ${photographer.surname}`,
        item: canonicalUrl,
      },
    ],
  };

  const biographyForHuman = getHumanReadableBiography(
    photographer.biography_md ?? "",
  );

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PhotographerJsonLd
        photographer={photographer}
        canonicalUrl={canonicalUrl}
        ogImageUrl={ogImageUrl}
      />
      {gallerySchemaImages.length > 0 && (
        <JsonLdSchema
          type="ImageGallery"
          name={`${photographer.name} ${photographer.surname} Gallery`}
          description={`Curated vintage photography by ${photographer.name} ${photographer.surname}`}
          images={gallerySchemaImages}
        />
      )}
      <main className={styles.photographerDetailPage}>
        <h1 className={styles.photographerDetailPageTitle}>
          {photographer.name} {photographer.surname}
        </h1>

        {/* GEO Quick Facts Section */}
        <section aria-label="Quick Facts">
          <ul>
            <li>
              <strong>Subject:</strong> {photographer.name}{" "}
              {photographer.surname}
            </li>
            <li>
              <strong>Nationality:</strong> {photographer.origin}
            </li>
            <li>
              <strong>Collection Size:</strong> {imagesWithUrl.length} images
            </li>
          </ul>
        </section>

        <p className={styles.sectionContent}>
          <time dateTime={photographer.birthdate?.split(" ")[0] ?? ""}>
            {formatLifespan(photographer.birthdate ?? "", "").replace(
              "Born ",
              "",
            )}
          </time>
          {" – "}
          <time dateTime={photographer.deceasedate?.split(" ")[0] ?? ""}>
            {formatLifespan("", photographer.deceasedate ?? "").replace(
              "Died ",
              "",
            )}
          </time>
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

        <article className={styles.subsectionHeader}>
          <h3 className={styles.sectionTitle}>Biography:</h3>
          <div className={styles.sectionContent}>
            <ReactMarkdown
              components={{
                h3: ({ node, ...props }) => (
                  <h3 className={styles.sectionTitle} {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className={styles.sectionContent} {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li style={{ marginBottom: "10px" }} {...props} />
                ),
              }}
            >
              {biographyForHuman}
            </ReactMarkdown>
          </div>
        </article>

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
