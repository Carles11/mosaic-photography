// app/community/photography/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { fetchContributorsWithFeaturedSSR } from "@/utils/fetchContributorsWithFeaturedSSR";
import PhotographyClientForm from "./PhotographyClientForm";
import styles from "./PhotographyCommunity.module.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Community Contributors – Mosaic Photography",
  description:
    "Contemporary photographers and creators who share their work through Mosaic Photography. Thoughtful, timeless image-making from around the world.",
  openGraph: {
    title: "Community Contributors – Mosaic Photography",
    description:
      "Contemporary photographers and creators who share their work through Mosaic Photography. Thoughtful, timeless image-making from around the world.",
    type: "website",
    url: "https://www.mosaic.photography/community/photography",
  },
  alternates: {
    canonical: "https://www.mosaic.photography/community/photography",
  },
};

export default async function ContributorsPage() {
  const contributors = await fetchContributorsWithFeaturedSSR();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>The community</h1>
        <h2 className={styles.pageSubTitle}>
          Contemporary photographers and visual artists who share selected work
          through Mosaic Photography.
        </h2>

        <p className={styles.intro}>
          Unlike the public domain archive, these photographs are contemporary
          work — owned by the photographers who made them, presented here by
          their choice. Mosaic displays them. The photographers keep everything
          else. Their work reflects a similar appreciation for craftsmanship,
          visual storytelling, and photographic heritage.
        </p>

        <p className={styles.intro}>
          Mosaic favors photographers whose work — analog or digital — embodies
          a thoughtful, timeless approach to image-making. We have a particular
          love for analogue photography, traditional processes, documentary
          work, portraiture, artistic nude photography, and projects that echo
          the visual heritage of our archive. Digital work is welcome when it
          captures the spirit of vintage classic photography.
        </p>
      </header>

      <section className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>
          How community contributor collections work
        </h2>

        <div className={styles.infoCard}>
          <p>
            Unlike the public domain archive, these photographs are contemporary
            work — owned by the photographers who made them, presented here by
            their choice. Mosaic displays them. The photographers keep
            everything else.
          </p>

          <ul className={styles.infoList}>
            <li>Your photographs remain yours, always.</li>
            <li>You choose how others may use them.</li>
            <li>Mosaic never claims ownership of your work.</li>
            <li>
              Every photographer confirms they hold the rights to what they
              submit.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.contributorSection}>
        <h2 className={styles.sectionTitle}>Community Collections </h2>
        {!contributors || contributors.length === 0 ? (
          <p className={styles.emptyState}>
            The gallery is growing. More contributors coming soon.
          </p>
        ) : (
          <div className={styles.grid}>
            {contributors.map((c) => {
              const imageUrl =
                c.featuredImage?.s3Progressive?.[0]?.url ??
                c.featuredImage?.url ??
                "/favicons/android-chrome-512x512.png";
              return (
                <Link
                  key={c.id}
                  href={`/community/photography/${c.slug}`}
                  className={`${styles.card} no-fancy-link`}
                >
                  <div className={styles.cardImageWrapper}>
                    {c.featuredImage ? (
                      <Image
                        src={imageUrl}
                        alt={c.featuredImage.title || c.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder} />
                    )}
                  </div>
                  <h3 className={styles.cardName}>{c.name}</h3>
                  <div className={styles.cardMeta}>
                    <span>{c.country || "Global"}</span>
                    <span className={styles.license}>{c.license_default}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* New Call to Action with collapsible form */}
      <PhotographyClientForm />
    </main>
  );
}
