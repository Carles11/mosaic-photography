import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "./PhotographyDetail.module.css";
import {
  fetchAllContributorSlugsSSR,
  fetchContributorBySlugSSR,
} from "@/utils/fetchContributorBySlugSSR";
import PhotographerGalleryZoom from "@/components/gallery/PhotographerGalleryZoom";
import Image from "next/image";
import { fetchContributorBySlugWithFeaturedSSR } from "@/utils/fetchContributorBySlugWithFeaturedSSR";
import ShareButtons from "@/components/buttons/ShareButtons";

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
  const contributor = await fetchContributorBySlugSSR(slug);

  const baseUrl = `https://www.mosaic.photography/community/photography/${slug}`;

  if (!contributor) {
    return {
      title: "Community – Mosaic Photographers",
      description:
        "Community users contributing with a gallery on Mosaic Photography. Browse photographs, collections and private works.",
      openGraph: {
        title: "Community – Mosaic Photographers",
        description:
          "Mosaic is a free, ad-free archive of public domain photography from the late 19th and early 20th centuries.",
        type: "website",
        url: baseUrl,
      },
      alternates: {
        canonical: baseUrl,
      },
    };
  }

  const description = `${contributor.name} contributor gallery on Mosaic Photography. Browse photographs, collections and public domain works.`;

  return {
    title: `${contributor.name} – Mosaic Contributors`,
    description,
    openGraph: {
      title: `${contributor.name} – Mosaic Contributors`,
      description,
      type: "website",
      url: baseUrl,
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

  // Then in the JSX, add this after the <h2> in aboutSection:
  return (
    <main className={styles.page}>
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
