// app/contributors/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getContributors } from "@/utils/fetchContributorsSSR";
import ContributorClient from "./ContributorsClient";
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
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Contributors</h1>
        <p className={styles.intro}>
          Contemporary photographers and creators who have chosen to share part
          of their work through Mosaic. Each collection remains under the
          photographer&apos;s license, presented with their permission.
        </p>
      </header>

      <section className={styles.contributorSection}>
        <h2 className={styles.sectionTitle}>Active Collections</h2>
        {!contributors || contributors.length === 0 ? (
          <p className={styles.emptyState}>
            The gallery is growing. More contributors coming soon.
          </p>
        ) : (
          <div className={styles.grid}>
            {contributors.map((c) => (
              <Link
                key={c.id}
                href={`/contributors/${c.slug}`}
                className={`${styles.card} no-fancy-link`}
              >
                <div className={styles.avatarPlaceholder} />
                <h3 className={styles.cardName}>{c.name}</h3>
                <div className={styles.cardMeta}>
                  <span>{c.country || "Global"}</span>
                  <span className={styles.license}>{c.license_default}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* New Call to Action with collapsible form */}
      <ContributorClient />
    </main>
  );
}
