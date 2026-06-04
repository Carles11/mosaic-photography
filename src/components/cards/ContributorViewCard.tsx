"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { sendGTMEvent } from "@next/third-parties/google";
import type { ContributorWithFeatured } from "@/utils/fetchContributorsWithFeaturedSSR";
import styles from "./ContributorViewCard.module.css";

export interface ContributorViewCardProps {
  contributor: ContributorWithFeatured;
}

const DESCRIPTION_PREVIEW_LENGTH = 180;

function getContributorPreview(contributor: ContributorWithFeatured) {
  const source = contributor.bio || contributor.description || "";
  const trimmed = source.trim();

  if (!trimmed) return "";
  if (trimmed.length <= DESCRIPTION_PREVIEW_LENGTH) return trimmed;

  return `${trimmed.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}...`;
}

const ContributorViewCard: React.FC<ContributorViewCardProps> = ({
  contributor,
}) => {
  const href = `/community/photography/${contributor.slug}`;
  const preview = useMemo(
    () => getContributorPreview(contributor),
    [contributor],
  );

  const featuredTitle =
    contributor.featuredImage?.title?.trim() ||
    `Featured work by ${contributor.name}`;

  const imageUrl =
    contributor.featuredImage?.s3Progressive?.[0]?.url ??
    contributor.featuredImage?.url ??
    "/favicons/android-chrome-512x512.png";

  const handleCardClick = () => {
    sendGTMEvent({
      event: "contributorCardClicked",
      value: contributor.slug,
      contributor: contributor.name,
    });
  };

  return (
    <article className={styles.card}>
      <Link
        href={href}
        className={styles.cardImageWrap}
        onClick={handleCardClick}
        aria-label={`View contributor ${contributor.name}`}
      >
        <Image
          src={imageUrl}
          alt={featuredTitle}
          fill
          sizes="(max-width: 768px) 87vw, 280px"
          className={styles.cardImage}
        />
      </Link>

      <div className={styles.cardOverlay} />

      <div className={styles.cardBody}>
        <Link
          href={href}
          className={`no-fancy-link ${styles.contributorName}`}
          onClick={handleCardClick}
        >
          {contributor.name.toUpperCase()}
        </Link>

        <div className={styles.metaRow}>
          {contributor.country && (
            <p className={styles.country}>{contributor.country}</p>
          )}
          {contributor.license_default && (
            <p className={styles.license}>{contributor.license_default}</p>
          )}
        </div>

        {preview && (
          <p className={styles.biography}>
            <strong>About: </strong>
            {preview}
          </p>
        )}

        <div className={styles.actions}>
          <Link
            href={href}
            className={styles.profileButton}
            onClick={handleCardClick}
          >
            Explore contributor →
          </Link>

          {contributor.instagram && (
            <a
              href={contributor.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramLink}
            >
              Instagram
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export default ContributorViewCard;
