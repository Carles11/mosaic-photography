import { useState } from "react";
import Link from "next/link";
import Dropdown from "@/components/inputs/dropDown";
import { useModal } from "@/context/modalContext/useModal";
import type { DropdownItem } from "@/types/dropdown";
import ImageWrapper from "../wrappers/ImageWrapper";

import { Photographer } from "@/types/gallery";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import styles from "./PhotographersViewCard.module.css";

declare global {
  interface Window {
    __AGE_CONSENT_OPEN__?: boolean;
  }
}

export interface PhotographersViewCardProps {
  photographers?: Photographer[];
  onLoginRequired?: () => void;
}

const PhotographersViewCard: React.FC<PhotographersViewCardProps> = ({
  photographers: photographersProp,
  onLoginRequired,
}) => {
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

  const { open } = useModal();
  const [expandedBioIdx, setExpandedBioIdx] = useState<number | null>(null);

  return (
    <div className={styles.photographersViewCardContainer}>
      <div ref={sliderRef} className="keen-slider">
        {photographersProp && photographersProp.length > 0 ? (
          photographersProp.map((photographer, idx) => {
            const portrait = photographer.images?.[0];
            let parsedStores: DropdownItem[] = [];
            if (photographer.store && photographer.store.length > 0) {
              parsedStores = photographer.store
                .map((storeString: string) => {
                  try {
                    const store = JSON.parse(storeString);
                    return {
                      store: String(store.store),
                      website: String(store.website),
                      affiliate: Boolean(store.affiliate),
                    };
                  } catch {
                    return null;
                  }
                })
                .filter((item): item is DropdownItem => item !== null);
            }
            return (
              <div
                key={photographer.surname + idx}
                className={`keen-slider__slide ${styles.photographersViewCard}`}
                tabIndex={0}
                aria-label={`Photographer card: ${photographer.name} ${photographer.surname}`}
              >
                <div className={styles.imageContainer}>
                  {portrait ? (
                    <Link
                      href={`/photographers/${photographer.surname}`}
                      className={`no-fancy-link ${styles.authorName}`}
                      tabIndex={0}
                    >
                      <ImageWrapper
                        image={{
                          ...portrait,
                          title: `Portrait of photographer ${photographer.name} ${photographer.surname}`,
                        }}
                      />
                    </Link>
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
                <h3 className={`fancy-link ${styles.authorName}`}>
                  <Link
                    href={`/photographers/${photographer.name}/${photographer.id}`}
                    className={styles.authorName}
                    tabIndex={0}
                  >
                    {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                  </Link>
                </h3>

                {photographer.biography && (
                  <p
                    className={
                      styles.biography +
                      (expandedBioIdx === idx ? " " + styles.expanded : "")
                    }
                    onClick={() =>
                      setExpandedBioIdx(expandedBioIdx === idx ? null : idx)
                    }
                    tabIndex={0}
                    role="button"
                    aria-expanded={expandedBioIdx === idx}
                  >
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
                {parsedStores.length > 0 && (
                  <Dropdown buttonText="Prints & books" items={parsedStores} />
                )}
                {photographer.website && (
                  <a
                    href={photographer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.authorCTA}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.gtag) {
                        window.gtag("event", "websiteClicked", {
                          event_category: "photographer",
                          event_label: photographer.website,
                        });
                      }
                    }}
                  >
                    Website
                  </a>
                )}
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
