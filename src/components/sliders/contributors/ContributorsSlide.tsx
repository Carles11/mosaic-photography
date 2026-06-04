"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import ContributorViewCard from "@components/cards/ContributorViewCard";
import ViewToggleButtons from "@components/buttons/viewToggleButtons";
import { ContributorWithFeatured } from "@/utils/fetchContributorsWithFeaturedSSR";
import styles from "./ContributorsSlide.module.css";

interface ContributorsSlideProps {
  contributors: ContributorWithFeatured[];
}

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Nude", value: "nude" },
  { label: "Not nude", value: "not-nude" },
];

const ContributorsSlide: React.FC<ContributorsSlideProps> = ({
  contributors,
}) => {
  const [selected, setSelected] = useState<"all" | "nude" | "not-nude">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  console.log("Rendering ContributorsSlide", { contributors });
  const normalizedContributors = useMemo(
    () => contributors.filter((contributor) => contributor.slug),
    [contributors],
  );

  const filteredContributors = useMemo(() => {
    if (selected === "all") return normalizedContributors;
    console.log("Filtering contributors", { selected, normalizedContributors });
    return normalizedContributors.filter((contributor) => {
      const nudityValue =
        (contributor as { featuredImage?: { nudity?: boolean | null } })
          .featuredImage?.nudity ?? false;

      const isNude = nudityValue === true;

      return selected === "nude" ? isNude : !isNude;
    });
  }, [normalizedContributors, selected]);

  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  return (
    <div className={styles.contributorsSlideContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.subTitle} id="contributors-title">
          FROM THE COMMUNITY
        </h2>
        <h4 className={styles.subTitle}>
          <Link href="/contributors">Add your piece to the mosaic →</Link>
        </h4>
      </div>

      <p className={styles.sectionIntro}>
        A growing circle of contemporary photographers who believe the silver
        process still has something to say.
      </p>

      <div className={styles.topRow}>
        <div className={styles.pillsRow}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={selected === f.value ? styles.pillActive : styles.pill}
              onClick={() =>
                setSelected(f.value as "all" | "nude" | "not-nude")
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <ViewToggleButtons viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {viewMode === "list" ? (
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {filteredContributors.map((contributor) => (
              <div className={styles.emblaSlide} key={contributor.id}>
                <ContributorViewCard contributor={contributor} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {filteredContributors.map((contributor) => (
            <div className={styles.gridItem} key={contributor.id}>
              <ContributorViewCard contributor={contributor} />
            </div>
          ))}
        </div>
      )}

      <div className={styles.footerLinks}>
        <Link
          href="/contributors"
          className={`no-fancy-link ${styles.seeAllLink}`}
        >
          Contemporary voices. Analogue hearts. →
        </Link>
      </div>
    </div>
  );
};

export default ContributorsSlide;
