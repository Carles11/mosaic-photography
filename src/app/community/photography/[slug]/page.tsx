import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAllContributorSlugsSSR } from "@/utils/fetchContributorBySlugSSR";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import Image from "next/image";
import { fetchContributorBySlugWithFeaturedSSR } from "@/utils/fetchContributorBySlugWithFeaturedSSR";
import ShareButtons from "@/components/buttons/ShareButtons";
import Link from "next/link";
import { serializeJsonLd } from "@/helpers/jsonLd";
import {
  markdownToPlainText,
  trimToWordBoundary,
} from "@/utils/clean-content";

import styles from "./PhotographyDetail.module.css";

type ContributorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await fetchAllContributorSlugsSSR();

  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: ContributorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const contributor = await fetchContributorBySlugWithFeaturedSSR(slug);

  const baseUrl = `https://www.mosaic.photography/community/photography/${slug}`;

  if (!contributor) {
    const description =
      "Community users contributing with a gallery on Mosaic Photography. Browse photographs, collections and contemporary works.";

    return {
      title: "Community – Mosaic Photographers",
      description,
      openGraph: {
        title: "Community – Mosaic Photographers",
        description,
        type: "website",
        url: baseUrl,
      },
      twitter: {
        card: "summary_large_image",
        title: "Community – Mosaic Photographers",
        description,
        images: ["/images/og-image.jpg"],
      },
      alternates: {
        canonical: baseUrl,
      },
    };
  }

  const title = `${contributor.name} – Mosaic Contributors`;
  const description = `${contributor.name} – contemporary photographs shared on Mosaic Photography's community gallery. The photographer keeps all rights.`;

  const featuredImage = contributor.featuredImage;
  const renditions = (featuredImage?.s3Progressive ?? []).filter(
    (r) => !r.url.includes("/originalsWEBP/"),
  );
  const ogRendition =
    renditions.find((r) => r.width === 1200) ??
    renditions[renditions.length - 1];
  const ogImageUrl =
    ogRendition?.url ?? featuredImage?.url ?? "/images/og-image.jpg";
  const ogWidth = ogRendition?.width;
  const ogHeight =
    ogRendition && featuredImage?.width && featuredImage?.height
      ? Math.round(
          (ogRendition.width * featuredImage.height) / featuredImage.width,
        )
      : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: baseUrl,
      images: [
        {
          url: ogImageUrl,
          alt: contributor.name,
          ...(ogWidth && ogHeight
            ? { width: ogWidth, height: ogHeight }
            : featuredImage
              ? {}
              : { width: 1200, height: 630 }),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

export default async function ContributorDetailPage({
  params,
}: ContributorPageProps) {
  const { slug } = await params;
  if (!slug) return notFound();

  const contributor = await fetchContributorBySlugWithFeaturedSSR(slug);
  if (!contributor) return notFound();

  const heroImage = contributor.featuredImage;
  // Add this inside your ContributorDetailPage component, before the return
  const shareUrl = `https://www.mosaic.photography/community/photography/${slug}`;
  const shareText = `${contributor.name} on Mosaic Photography`;

  const imageUrl = heroImage
    ? (heroImage.s3Progressive?.[0]?.url ??
      heroImage.url ??
      "/images/og-image.jpg")
    : "/images/og-image.jpg";

  const personDescription = contributor.description
    ? trimToWordBoundary(markdownToPlainText(contributor.description), 300)
    : "";

  const profilePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: contributor.name,
      url: shareUrl,
      ...(heroImage ? { image: imageUrl } : {}),
      ...(personDescription ? { description: personDescription } : {}),
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
        name: "Community",
        item: "https://www.mosaic.photography/community/photography",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: contributor.name,
        item: shareUrl,
      },
    ],
  };

  // Then in the JSX, add this after the <h2> in aboutSection:
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(profilePageJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
        }}
      />

      <section className={styles.hero}>
        {heroImage && (
          <div className={styles.heroImageWrapper}>
            <Image
              src={
                heroImage.s3Progressive?.[0]?.url ??
                "/favicons/android-chrome-512x512.png"
              }
              alt={`${contributor.name} featured photograph`}
              fill
              priority
              sizes="100vw"
              className={styles.heroImage}
            />
          </div>
        )}
        <div>
          <p>
            <Link href="/community/photography" className={styles.backLink}>
              ← Back to Photography Community
            </Link>
          </p>
        </div>
        <div className={styles.heroOverlay}>
          <h1 className={styles.pageTitle}>{contributor.name}</h1>

          <div className={styles.heroMeta}>
            {contributor.country && (
              <span className={styles.metaPill}>{contributor.country}</span>
            )}

            {contributor.license_default && (
              <span className={styles.metaPill}>
                {contributor.license_default}
              </span>
            )}

            <span className={styles.metaPill}>
              {contributor.images?.length ?? 0} photographs
            </span>
          </div>
        </div>
      </section>

      <section className={styles.aboutSection}>
        <h2>About the collection</h2>
        <ShareButtons url={shareUrl} title={shareText} />

        {contributor.description && <p>{contributor.description}</p>}

        {contributor.bio && <p>{contributor.bio}</p>}

        <div className={styles.links}>
          {contributor.website && (
            <a
              href={contributor.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website →
            </a>
          )}

          {contributor.instagram && (
            <a
              href={contributor.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram →
            </a>
          )}
        </div>
      </section>

      <section className={styles.gallerySection}>
        <h2 className={styles.galleryTitle}>
          Gallery ({contributor.images?.length ?? 0})
        </h2>

        <PhotographerGalleryZoom
          images={(contributor.images ?? []).map((img) => ({
            ...img,
            title: img.title ?? "",
            author: contributor.name,
            url:
              img.s3Progressive?.[0]?.url ??
              "/favicons/android-chrome-512x512.png",
          }))}
        />
      </section>
    </main>
  );
}
