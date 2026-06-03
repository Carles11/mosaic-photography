"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { sendGTMEvent } from "@next/third-parties/google";
import {
  DotButton,
  useDotButton,
} from "@/components/sliders/photographers/EmblaSliderComponents/EmblaCarouselDotButton";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "@/components/sliders/photographers/EmblaSliderComponents/EmblaCarouselArrowButtons";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import type { ContributorWithFeatured } from "@/utils/fetchContributorsWithFeaturedSSR";
import styles from "./ContributorViewCard.module.css";

export interface ContributorViewCardProps {
  contributors: ContributorWithFeatured[];
}

const DESCRIPTION_PREVIEW_LENGTH = 220;

function getContributorPreview(contributor: ContributorWithFeatured) {
  const source = contributor.bio || contributor.description || "";
  const trimmed = source.trim();

  if (!trimmed) return "";
  if (trimmed.length <= DESCRIPTION_PREVIEW_LENGTH) return trimmed;

  return `${trimmed.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}...`;
}

const ContributorViewCard: React.FC<ContributorViewCardProps> = ({
  contributors,
}) => {
  const [expandedBioIdx, setExpandedBioIdx] = useState<number | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: true,
    align: "start",
    dragFree: false,
    axis: "x",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    duration: 55,
  });
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const normalizedContributors = useMemo(
    () => contributors.filter((contributor) => contributor.slug),
    [contributors],
  );

  const handleCardClick = (contributor: ContributorWithFeatured) => {
    sendGTMEvent({
      event: "contributorCardClicked",
      value: contributor.slug,
      contributor: contributor.name,
    });
  };

  const handleExternalClick = (
    eventName: "contributorWebsiteClicked" | "contributorInstagramClicked",
    contributor: ContributorWithFeatured,
    value: string,
  ) => {
    sendGTMEvent({
      event: eventName,
      value,
      contributor: contributor.name,
    });
  };

  if (normalizedContributors.length === 0) {
    return <div className={styles.emptyState}>No contributors found.</div>;
  }

  return (
    <div className={styles.contributorViewCardContainer}>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {normalizedContributors.map((contributor, idx) => {
            const href = `/contributors/${contributor.slug}`;
            const preview = getContributorPreview(contributor);
            const featuredTitle =
              contributor.featuredImage?.title?.trim() ||
              `Featured work by ${contributor.name}`;

            return (
              <article
                key={contributor.id}
                className={`embla__slide ${styles.contributorViewCard}`}
                tabIndex={0}
                aria-label={`Contributor card: ${contributor.name}`}
              >
                <Link
                  href={href}
                  tabIndex={0}
                  onClick={() => handleCardClick(contributor)}
                >
                  <h3 className={`fancy-link ${styles.contributorName}`}>
                    {contributor.name.toUpperCase()}
                  </h3>
                </Link>

                <div className={styles.imageContainer}>
                  <Link
                    href={href}
                    className={`no-fancy-link ${styles.imageLink}`}
                    tabIndex={0}
                    onClick={() => handleCardClick(contributor)}
                    aria-label={`View contributor ${contributor.name}`}
                  >
                    {contributor.featuredImage ? (
                      <ImageWrapper
                        image={{
                          ...contributor.featuredImage,
                          title: featuredTitle,
                          url:
                            contributor.featuredImage.s3Progressive?.[0]?.url ??
                            contributor.featuredImage.url ??
                            "/favicons/android-chrome-512x512.png",
                        }}
                        imgStyleOverride={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        sizes="(max-width: 480px) 88vw, (max-width: 768px) 82vw, (max-width: 1200px) 44vw, 34vw"
                        showOverlayButtons={false}
                      />
                    ) : (
                      <div className={styles.imageFallback}>
                        <span className={styles.imageFallbackLabel}>
                          Featured image coming soon
                        </span>
                      </div>
                    )}
                  </Link>
                </div>

                <div className={styles.metaRow}>
                  {contributor.country && (
                    <p className={styles.country}>{contributor.country}</p>
                  )}
                  {contributor.license_default && (
                    <p className={styles.license}>
                      {contributor.license_default}
                    </p>
                  )}
                </div>

                {preview && (
                  <p
                    className={
                      styles.biography +
                      (expandedBioIdx === idx ? ` ${styles.expanded}` : "")
                    }
                    onClick={() =>
                      setExpandedBioIdx(expandedBioIdx === idx ? null : idx)
                    }
                    tabIndex={0}
                    role="button"
                    aria-expanded={expandedBioIdx === idx}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setExpandedBioIdx(expandedBioIdx === idx ? null : idx);
                      }
                    }}
                  >
                    <strong>About: </strong>
                    {preview}
                  </p>
                )}

                <div className={styles.actions}>
                  <Link
                    href={href}
                    className={`no-fancy-link ${styles.profileLink}`}
                    onClick={() => handleCardClick(contributor)}
                  >
                    Explore contributor →
                  </Link>

                  {contributor.website && (
                    <a
                      href={contributor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`no-fancy-link ${styles.externalLink}`}
                      onClick={() =>
                        handleExternalClick(
                          "contributorWebsiteClicked",
                          contributor,
                          contributor.website as string,
                        )
                      }
                    >
                      Website
                    </a>
                  )}

                  {contributor.instagram && (
                    <a
                      href={contributor.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`no-fancy-link ${styles.externalLink}`}
                      onClick={() =>
                        handleExternalClick(
                          "contributorInstagramClicked",
                          contributor,
                          contributor.instagram as string,
                        )
                      }
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.embla__navigation}>
          <div className={styles.embla__navigation__arrows}>
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
          <div className={styles.embla__navigation__dots}>
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={normalizedContributors[index]?.id ?? index}
                onClick={() => onDotButtonClick(index)}
                selected={index === selectedIndex}
                label={normalizedContributors[index]?.name || "Contributor"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorViewCard;
