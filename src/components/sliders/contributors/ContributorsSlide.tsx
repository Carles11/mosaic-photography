import React from "react";
import Link from "next/link";
import styles from "./ContributorsSlide.module.css";
import ContributorViewCard from "@components/cards/ContributorViewCard";
import { ContributorWithFeatured } from "@/utils/fetchContributorsWithFeaturedSSR";

interface ContributorsSlideProps {
  contributors: ContributorWithFeatured[];
}

const ContributorsSlide: React.FC<ContributorsSlideProps> = ({
  contributors,
}) => {
  return (
    <div className={styles.contributorsSlideContainer}>
      <h2 className={styles.subTitle} id="contributors-title">
        MOSAIC&apos;S CONTRIBUTORS
      </h2>
      <p className={styles.sectionIntro}>
        Contemporary photographers who have chosen to share their work through
        Mosaic. Explore their collections and learn how to contribute yours.
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
