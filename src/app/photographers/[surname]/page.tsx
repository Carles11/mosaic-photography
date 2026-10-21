import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import {
  fetchPhotographerBySlugSSR,
  fetchAllPhotographerSlugsSSR,
} from "@/utils/fetchPhotographerByIdSSR";
import { fetchPhotographersBasic } from "@/utils/fetchPhotographersBasic";
import { PhotographerLinks } from "../client/PhotographerLinks";
import { getAffiliateProductsByAuthor } from "@/utils/fetchAffiliateDataSSR";
import Timeline from "@/components/timeline/Timeline";
import { getTimelineBySlug } from "@/lib/timeline/photographersTimelines";
import { TimelineItemModelProps } from "@/types/components";
import { formatLifespan, formatYearRange, getYear, toIsoDate } from "@/helpers/dates";
import type { Photographer } from "@/types/gallery";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import { serializeJsonLd } from "@/helpers/jsonLd";
import styles from "./Photographers.module.css";
import {
  cleanText,
  cutAtSentenceEnd,
  getHumanReadableBiography,
  markdownToPlainText,
  stripLeadingHeading,
  trimToWordBoundary,
} from "@/utils/clean-content";

// Revalidate all pre-built photographer pages every 24 hours (ISR)
export const revalidate = 86400;

// Pre-generate all known photographer slugs at build time
export async function generateStaticParams() {
  const slugs = await fetchAllPhotographerSlugsSSR();
  return slugs.map((surname) => ({ surname }));
}

// Markdown rendering shared by the intro and the biography.
const markdownComponents: Components = {
  h3: ({ ...props }) => <h3 className={styles.sectionTitle} {...props} />,
  p: ({ ...props }) => <p className={styles.sectionContent} {...props} />,
  li: ({ ...props }) => <li style={{ marginBottom: "10px" }} {...props} />,
};

/**
 * Short, factual answer for the top of the page. AI engines quote the first
 * block of a page, so the answer must not be buried under the timeline.
 */
function buildSeoTitle({
  name,
  surname,
  birthYear,
  deathYear,
}: {
  name: string;
  surname: string;
  birthYear?: number;
  deathYear?: number;
}): string {
  const years =
    birthYear && deathYear ? ` (${birthYear}–${deathYear})` : "";
  const title = `${name} ${surname}${years}: Public Domain Photographs | Mosaic`;
  return title.length > 70 ? title.replace(" | Mosaic", "") : title;
}

function buildSeoDescription({
  name,
  surname,
  birthYear,
  deathYear,
  origin,
  imageCount,
  nudeCount,
}: {
  name: string;
  surname: string;
  birthYear?: number;
  deathYear?: number;
  origin: string;
  imageCount: number;
  nudeCount: number;
}): string {
  const years =
    birthYear && deathYear ? ` (${birthYear}–${deathYear})` : "";
  const originPart = origin ? `, ${origin}` : "";
  const lead = `${name} ${surname}${years}${originPart}: biography, timeline and ${imageCount} public-domain photographs`;
  const nudePart = nudeCount > 0 ? ", including fine-art nude studies" : "";
  const licence = ". Free to use (CC PDM 1.0).";

  const full = `${lead}${nudePart}${licence}`;
  if (full.length <= 160) return full;

  // Long origins (e.g. "Wismar, Grand Duchy of Mecklenburg-Schwerin, Germany")
  // push the description over 160 chars. Drop the least important part
  // first, and always end on a complete sentence: a description cut in the
  // middle of ", including ..." reads as broken.
  const withoutLicence = `${lead}${nudePart}.`;
  if (withoutLicence.length <= 160) return withoutLicence;

  const short = `${lead}.`;
  if (short.length <= 160) return short;

  return `${trimToWordBoundary(lead, 159)}.`;
}

/**
 * The `intro_md` short answer, in plain text. Falls back to the first
 * paragraph of the biography. The "AI-Search & GEO Context" block is never
 * part of it: it is written for engines, not for readers.
 */
function buildPersonDescription(photographer: Photographer): string {
  const plainIntro = markdownToPlainText(photographer.intro_md ?? "");
  if (plainIntro) return cutAtSentenceEnd(plainIntro, 300);

  const biography = getHumanReadableBiography(photographer.biography_md ?? "");
  const firstParagraph = biography.split(/\n\s*\n/)[0] ?? "";
  return cutAtSentenceEnd(markdownToPlainText(firstParagraph), 300);
}

// Helper: generate SEO metadata for each photographer page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ surname: string }>;
}): Promise<Metadata> {
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
  const origin = cleanText(photographer.origin);
  const images = photographer.images ?? [];
  const imageCount = images.length;
  const nudeCount = images.filter((img) => img.nudity === "nude").length;
  const birthYear = getYear(photographer.birthdate);
  const deathYear = getYear(photographer.deceasedate);
  const canonicalUrl = `https://www.mosaic.photography/photographers/${urlSurname}`;

  const title = buildSeoTitle({ name, surname, birthYear, deathYear });
  const description = buildSeoDescription({
    name,
    surname,
    birthYear,
    deathYear,
    origin,
    imageCount,
    nudeCount,
  });

  return {
    title: { absolute: title },
    description,
    keywords: [
      "public domain",
      "gallery",
      "iconic photographers",
      name,
      surname,
      "Mosaic Gallery",
      origin,
      ...(nudeCount > 0 ? ["vintage nude photography", "classic nude art"] : []),
    ],
    openGraph: {
      title,
      description,
      type: "profile",
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          alt: `${name} ${surname}: public-domain photograph`,
        },
      ],
      // Next reads these from the top level of the OpenGraph object for
      // type "profile" (og:profile:first_name / og:profile:last_name).
      firstName: name,
      lastName: surname,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const birthDate = toIsoDate(photographer.birthdate);
  const deathDate = toIsoDate(photographer.deceasedate);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd({
          "@context": "https://schema.org",
          "@type": "Person",
          name: `${photographer.name} ${photographer.surname}`,
          url: canonicalUrl,
          description: buildPersonDescription(photographer),
          image: ogImageUrl,
          jobTitle: "Photographer",
          ...(birthDate && { birthDate }),
          ...(deathDate && { deathDate }),
          ...(cleanText(photographer.origin) && {
            nationality: cleanText(photographer.origin),
          }),
          // sameAs is for references that identify the PERSON — their own
          // site, Wikipedia, an archive. The legacy `store` column held
          // affiliate shop links, and concatenating those here would have
          // asserted that an amzn.to URL authoritatively identifies Edward
          // Weston. It was inert only because fetchPhotographerBySlugSSR
          // never selected `store`; one added column and it would have been
          // publishing undeclared affiliate links as structured data.
          // Paid links belong in PhotographerLinks with rel="sponsored".
          sameAs: [photographer.website].filter(Boolean),
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

  const origin = cleanText(photographer.origin);

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

  // Answer first: the short factual intro, without its own Markdown heading
  // (the page already has the H1).
  const introMarkdown = stripLeadingHeading(photographer.intro_md ?? "");

  const birthYear = getYear(photographer.birthdate);
  const deathYear = getYear(photographer.deceasedate);
  const lifeYears = formatYearRange(birthYear, deathYear);

  // Internal links to the rest of the collection.
  const allPhotographers = (await fetchPhotographersBasic()) ?? [];
  const otherPhotographers = allPhotographers
    .filter((p) => p.slug && p.slug !== photographer.slug)
    .sort((a, b) => a.surname.localeCompare(b.surname));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
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

        {introMarkdown && (
          <section aria-labelledby="who-was-heading">
            <h2 id="who-was-heading" className={styles.timelineTitle}>
              Who was {photographer.name} {photographer.surname}?
            </h2>
            <ReactMarkdown components={markdownComponents}>
              {introMarkdown}
            </ReactMarkdown>
          </section>
        )}

        {/* GEO Quick Facts Section */}
        <section aria-label="Quick Facts">
          <ul>
            {lifeYears && (
              <li>
                <strong>Lived:</strong> {lifeYears}
              </li>
            )}
            <li>
              <strong>Nationality:</strong> {origin}
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
          <p className={styles.sectionContent}>{origin}</p>
        </span>

        <article className={styles.subsectionHeader}>
          <h3 className={styles.sectionTitle}>Biography:</h3>
          <div className={styles.sectionContent}>
            <ReactMarkdown components={markdownComponents}>
              {biographyForHuman}
            </ReactMarkdown>
          </div>
        </article>

        <PhotographerLinks
          affiliateProducts={await getAffiliateProductsByAuthor(
            photographer.author,
          )}
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

      <section aria-labelledby="more-photographers-heading">
        <h2 id="more-photographers-heading" className={styles.timelineTitle}>
          More photographers in the collection
        </h2>
        <ul className={styles.morePhotographersList}>
          {otherPhotographers.map((other) => {
            const otherYears = formatYearRange(
              getYear(other.birthdate),
              getYear(other.deceasedate),
            );
            return (
              <li key={other.slug}>
                <Link href={`/photographers/${other.slug}`}>
                  {other.name} {other.surname}
                  {otherYears ? ` (${otherYears})` : ""}
                </Link>
              </li>
            );
          })}
          <li>
            <Link href="/photographers">All photographers</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
