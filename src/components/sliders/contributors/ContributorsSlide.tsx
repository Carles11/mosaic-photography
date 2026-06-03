import React from "react";
import Link from "next/link";
import ContributorViewCard from "@components/cards/ContributorViewCard";
import { ContributorWithFeatured } from "@/utils/fetchContributorsWithFeaturedSSR";

import styles from "./ContributorsSlide.module.css";

interface ContributorsSlideProps {
  contributors: ContributorWithFeatured[];
}

const ContributorsSlide: React.FC<ContributorsSlideProps> = ({
  contributors,
}) => {
  return (
    <div className={styles.contributorsSlideContainer}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.subTitle} id="contributors-title">
          MOSAIC&apos;S CONTRIBUTORS
        </h2>
        <h4 className={styles.subTitle}>
          <Link href="/contributors">Learn how to contribute →</Link>
        </h4>
      </div>
      <p className={styles.sectionIntro}>
        Contemporary photographers who have chosen to share their work through
        Mosaic.
      </p>

      <ContributorViewCard contributors={contributors} />

      <div className={styles.footerLinks}>
        <Link
          href="/contributors"
          className={`no-fancy-link ${styles.seeAllLink}`}
        >
          See all contributors →
        </Link>
        <Link
          href="/contributors#how-to-contribute"
          className={`no-fancy-link ${styles.contributeLink}`}
        >
          How to contribute
        </Link>
      </div>
    </div>
  );
};

export default ContributorsSlide;
