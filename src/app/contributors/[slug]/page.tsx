import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContributorBySlug } from "@/utils/fetchContributorsSSR";
import styles from "./ContributorDetail.module.css";

type ContributorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ContributorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const contributor = await getContributorBySlug(slug);

  if (!contributor) {
    return {
      title: "Contributor – Mosaic Contributors",
      description: "Contributor profile on Mosaic Photography.",
    };
  }

  return {
    title: `${contributor.name} – Mosaic Contributors`,
    description: "Contributor profile on Mosaic Photography.",
    openGraph: {
      title: `${contributor.name} – Mosaic Contributors`,
      description: "Contributor profile on Mosaic Photography.",
    },
  };
}

function renderValue(value: string | null) {
  return value && value.trim().length > 0 ? value : "Not provided";
}

export default async function ContributorDetailPage({
  params,
}: ContributorPageProps) {
  const { slug } = await params;
  if (!slug) return notFound();

  const contributor = await getContributorBySlug(slug);
  if (!contributor) return notFound();

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>{contributor.name}</h1>

      <section className={styles.infoCard} aria-label="Contributor details">
        <dl className={styles.fields}>
          <div className={styles.fieldRow}>
            <dt className={styles.label}>Country</dt>
            <dd className={styles.value}>{renderValue(contributor.country)}</dd>
          </div>

          <div className={styles.fieldRow}>
            <dt className={styles.label}>Website</dt>
            <dd className={styles.value}>
              {contributor.website ? (
                <a
                  href={contributor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`no-fancy-link ${styles.externalLink}`}
                >
                  {contributor.website}
                </a>
              ) : (
                "Not provided"
              )}
            </dd>
          </div>

          <div className={styles.fieldRow}>
            <dt className={styles.label}>Instagram</dt>
            <dd className={styles.value}>
              {contributor.instagram ? (
                <a
                  href={contributor.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`no-fancy-link ${styles.externalLink}`}
                >
                  {contributor.instagram}
                </a>
              ) : (
                "Not provided"
              )}
            </dd>
          </div>

          <div className={styles.fieldRow}>
            <dt className={styles.label}>Bio</dt>
            <dd className={styles.value}>{renderValue(contributor.bio)}</dd>
          </div>

          <div className={styles.fieldRow}>
            <dt className={styles.label}>Description</dt>
            <dd className={styles.value}>
              {renderValue(contributor.description)}
            </dd>
          </div>

          <div className={styles.fieldRow}>
            <dt className={styles.label}>Default license</dt>
            <dd className={styles.value}>
              {renderValue(contributor.license_default)}
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.galleryPlaceholder}>
        <h2 className={styles.sectionTitle}>Gallery coming soon</h2>
      </section>
    </main>
  );
}
