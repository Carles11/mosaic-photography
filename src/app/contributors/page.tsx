import type { Metadata } from "next";
import Link from "next/link";
import { getContributors } from "@/utils/fetchContributorsSSR";
import styles from "./Contributors.module.css";

export const metadata: Metadata = {
  title: "Contributors | Mosaic Photography",
  description:
    "Contemporary photographers and creators who have chosen to share part of their work through Mosaic Photography.",
  openGraph: {
    title: "Contributors | Mosaic Photography",
    description:
      "Contemporary photographers and creators who have chosen to share part of their work through Mosaic Photography.",
  },
};

export default async function ContributorsPage() {
  const contributors = await getContributors();

  return (
    <main className={styles.page}>
      <h1 className={styles.pageTitle}>Contributors</h1>

      <p className={styles.intro}>
        Contributors are contemporary photographers and creators who have chosen
        to share part of their work through Mosaic. Unlike the historical
        public-domain archive, these collections remain under their respective
        licenses and are presented with the contributor&apos;s permission.
      </p>

      {!contributors || contributors.length === 0 ? (
        <p className={styles.emptyState}>No contributors found.</p>
      ) : (
        <div className={styles.grid}>
          {contributors.map((contributor) => (
            <Link
              key={contributor.id}
              href={`/contributors/${contributor.slug}`}
              className={`no-fancy-link ${styles.card}`}
              aria-label={`View contributor ${contributor.name}`}
            >
              <h2 className={styles.cardName}>{contributor.name}</h2>
              <div className={styles.cardMeta}>
                {contributor.country && (
                  <span className={styles.cardMetaItem}>
                    {contributor.country}
                  </span>
                )}
                {contributor.license_default && (
                  <span className={styles.cardMetaItem}>
                    {contributor.license_default}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
