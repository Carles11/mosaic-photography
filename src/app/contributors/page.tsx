// app/contributors/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getContributors } from "@/utils/fetchContributorsSSR";
import ContributorClient from "./ContributorsClient";
import styles from "./Contributors.module.css";
import Image from "next/image";

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
        <h1 className={styles.pageTitle}>Community contributors</h1>
        <p className={styles.intro}>
          Contemporary photographers and creators who have chosen to share
          selected work through Mosaic Photography.
        </p>

        <p className={styles.intro}>
          Unlike the main historical public domain archive, contributor
          collections contain contemporary photographs that remain under the
          copyright of their creators. Community contributors retain ownership
          of their work and choose how it may be licensed and distributed.
        </p>
      </header>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>
          How community contributor collections work
        </h2>

        <div className={styles.infoCard}>
          <p>
            Mosaic is best known for preserving and sharing public domain
            photography. Community contributor collections are different.
          </p>

          <p>
            Photographers retain ownership of their images and grant Mosaic
            permission to display selected works within the archive.
          </p>

          <ul className={styles.infoList}>
            <li>
              Community contributors remain the copyright holders of their
              photographs.
            </li>
            <li>
              Community contributors choose the license under which their work
              is made available.
            </li>
            <li>
              Mosaic does not claim ownership of community contributor images.
            </li>
            <li>
              Every community contributor confirms they have the necessary
              rights to submit and license their work.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.contributorSection}>
        <h2 className={styles.sectionTitle}>
          Active Collections of current community contributors
        </h2>
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
                {c.featuredImage ? (
                  <Image
                    src={`${c.featuredImage.base_url}/w400/${c.featuredImage.filename}`}
                    alt={c.featuredImage.title || c.name}
                    className={styles.cardImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.avatarPlaceholder} />
                )}{" "}
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
