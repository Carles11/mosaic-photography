import type { Metadata } from "next";
import Link from "next/link";
import { fetchPhotographersBasic } from "@/utils/fetchPhotographersBasic";
import { fetchPhotographerImageCountsSSR } from "@/utils/fetchPhotographerImageCountsSSR";
import { serializeJsonLd } from "@/helpers/jsonLd";
import { formatYearRange, getYear } from "@/helpers/dates";
import {
  cleanText,
  getFirstSentence,
  markdownToPlainText,
} from "@/utils/clean-content";
import styles from "./Photographers.module.css";

// Rebuild the index once a day (ISR), same as the photographer pages.
export const revalidate = 86400;

const PAGE_URL = "https://www.mosaic.photography/photographers";
const PAGE_TITLE =
  "Photographers: Public Domain Vintage Photography (1840s–1930s)";
const PAGE_DESCRIPTION =
  "Every photographer in the Mosaic public-domain collection: life dates, biography, timeline and public-domain photographs, free to use under CC PDM 1.0.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: "/photographers",
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    // A page-level `openGraph` replaces the layout one, so the image and
    // its alt have to be repeated here or the hub ships without a preview.
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mosaic Photography: public-domain vintage photography gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/images/og-image.jpg"],
  },
};

export default async function PhotographersIndexPage() {
  const photographers = (await fetchPhotographersBasic()) ?? [];
  const sorted = [...photographers].sort((a, b) =>
    a.surname.localeCompare(b.surname),
  );

  const imageCounts = await fetchPhotographerImageCountsSSR(
    sorted.map((p) => p.author),
  );

  const birthYears = sorted
    .map((p) => getYear(p.birthdate))
    .filter((year): year is number => year !== undefined);
  const deathYears = sorted
    .map((p) => getYear(p.deceasedate))
    .filter((year): year is number => year !== undefined);
  const earliestBirthYear = birthYears.length ? Math.min(...birthYears) : null;
  const latestDeathYear = deathYears.length ? Math.max(...deathYears) : null;

  const answerSentence = `Public-domain photographs by ${sorted.length} early photographers, organised by photographer, from ${earliestBirthYear ?? ""} to ${latestDeathYear ?? ""}: fine-art nudes, portraits and documentary work.`;

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Photographers in the Mosaic collection",
    url: PAGE_URL,
    description: PAGE_DESCRIPTION,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: sorted.map((p, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${PAGE_URL}/${p.slug}`,
        name: `${p.name} ${p.surname}`,
      })),
    },
  };

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
        item: PAGE_URL,
      },
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(collectionPageJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <h1 className={styles.pageTitle}>Photographers in the Mosaic collection</h1>
      <p className={styles.answer}>{answerSentence}</p>

      <ul className={styles.list}>
        {sorted.map((p) => {
          const years = formatYearRange(
            getYear(p.birthdate),
            getYear(p.deceasedate),
          );
          const total = imageCounts[p.author]?.total ?? 0;
          const origin = cleanText(p.origin);
          const summary = getFirstSentence(markdownToPlainText(p.intro_md ?? ""));
          return (
            <li key={p.slug ?? p.id} className={styles.item}>
              <Link href={`/photographers/${p.slug}`} className={styles.name}>
                {p.name} {p.surname}
              </Link>
              <span className={styles.meta}>
                {years ? `${years} · ` : ""}
                {origin ? `${origin} · ` : ""}
                {total} photographs
              </span>
              {summary && <p className={styles.summary}>{summary}</p>}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
