import { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import ImageWrapper from "../wrappers/ImageWrapper";
import styles from "./PhotographersViewCard.module.css";

// Extend the Window interface to include __AGE_CONSENT_OPEN__
declare global {
  interface Window {
    __AGE_CONSENT_OPEN__?: boolean;
  }
}

import { Photographer } from "@/types/gallery";

export interface PhotographersViewCardProps {
  photographers?: Photographer[];
  onLoginRequired?: () => void;
}

const PhotographersViewCard: React.FC<PhotographersViewCardProps> = ({
  photographers: photographersProp,
  onLoginRequired,
}) => {
  // SSR/SSG compatibility: only initialize keen-slider on client
  const [sliderRef] =
    typeof window !== "undefined"
      ? useKeenSlider<HTMLDivElement>({
          loop: false,
          mode: "snap",
          slides: { perView: 1, spacing: 24 },
          rubberband: true,
          breakpoints: {
            "(min-width: 768px)": { slides: { perView: 2, spacing: 24 } },
            "(min-width: 1200px)": { slides: { perView: 3, spacing: 24 } },
          },
        })
      : [undefined];

  console.log({ photographersProp });

  return (
    <div className={styles.photographersViewCardContainer}>
      <div ref={sliderRef} className={"keen-slider"}>
        {photographersProp && photographersProp.length > 0 ? (
          photographersProp.map((photographer, idx) => {
            const portrait = photographer.images.find((img) =>
              img.url.includes("000_aaa")
            );
            return (
              <div
                key={photographer.surname + idx}
                className={`keen-slider__slide ${styles.photographersViewCard}`}
                tabIndex={0}
                aria-label={`Photographer card: ${photographer.name} ${photographer.surname}`}
              >
                <div className={styles.imageContainer}>
                  {portrait ? (
                    <ImageWrapper
                      image={{
                        ...portrait,
                        title: `Portrait of photographer ${photographer.name} ${photographer.surname}`,
                      }}
                    />
                  ) : (
                    <img
                      src="/images/default-BG-image.png"
                      alt={`Portrait of photographer ${photographer.name} ${photographer.surname} (not available)`}
                      width={400}
                      height={500}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  )}
                </div>
                <h3 className={`fancy-link ${styles.authorName}`} tabIndex={0}>
                  {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                </h3>
                {photographer.biography && (
                  <p className={styles.biography}>
                    <strong>Biography: </strong>
                    <br />
                    {photographer.biography}
                  </p>
                )}
                {photographer.origin && (
                  <p className={styles.origin}>
                    <strong>Origin:</strong> {photographer.origin}
                  </p>
                )}
                {photographer.deceasedate && (
                  <p>
                    <strong>Deceasedate:</strong>{" "}
                    {new Date(photographer.deceasedate).toLocaleDateString()}
                  </p>
                )}
                <p className={`fancy-link ${styles.authorCTA}`} tabIndex={0}>
                  Dive Into {photographer.surname}&rsquo;s Art
                </p>
              </div>
            );
          })
        ) : (
          <div>No photographers found.</div>
        )}
      </div>
    </div>
  );
};

export default PhotographersViewCard;
