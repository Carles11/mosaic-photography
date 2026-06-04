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
  { label: "All", value: "mixed" },
  { label: "Nude", value: "nude" },
  { label: "Not nude", value: "non-nude" },
];

const ContributorsSlide: React.FC<ContributorsSlideProps> = ({
  contributors,
}) => {
  const [selected, setSelected] = useState<"mixed" | "nude" | "non-nude">(
    "mixed",
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  console.log("Rendering ContributorsSlide", { contributors });
  const normalizedContributors = useMemo(
    () => contributors.filter((contributor) => contributor.slug),
    [contributors],
  );
  const filteredContributors = useMemo(() => {
    switch (selected) {
      case "mixed":
        return normalizedContributors;

      case "nude":
        return normalizedContributors.filter((contributor) => {
          const nudityValue = contributor.nudity ?? "non-nude";
          return nudityValue === "nude" || nudityValue === "mixed";
        });

      case "non-nude":
        return normalizedContributors.filter((contributor) => {
          const nudityValue = contributor.nudity ?? "non-nude";
          return nudityValue === "non-nude" || nudityValue === "mixed";
        });

      default:
        return normalizedContributors;
    }
  }, [normalizedContributors, selected]);

  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  return (
    <div className={styles.contributorsSlideContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.subTitle} id="community-section-title">
          FROM THE COMMUNITY
        </h2>
        <h4 className={styles.subTitle}>
          <Link href="/community/photography">
            Add your piece to the mosaic →
          </Link>
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
                setSelected(f.value as "mixed" | "nude" | "non-nude")
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
        <Link href="/community/photography" className={`${styles.seeAllLink}`}>
          Contemporary voices. Analogue hearts. →
        </Link>
      </div>
    </div>
  );
};

export default ContributorsSlide;
