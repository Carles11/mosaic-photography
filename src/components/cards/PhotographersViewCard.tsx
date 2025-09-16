import useEmblaCarousel from "embla-carousel-react";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "@/components/sliders/photographers/EmblaSliderComponents/EmblaCarouselArrowButtons";
import {
  DotButton,
  useDotButton,
} from "@/components/sliders/photographers/EmblaSliderComponents/EmblaCarouselDotButton";
import { useState } from "react";
import Link from "next/link";
import Dropdown from "@/components/inputs/dropDown";
import type { DropdownItem } from "@/types/dropdown";
import ImageWrapper from "../wrappers/ImageWrapper";
import { slugify } from "@/utils/slugify";
import { Photographer } from "@/types/gallery";
import styles from "./PhotographersViewCard.module.css";
import Image from "next/image";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    skipSnaps: false,
    align: "start",
    dragFree: false,
    axis: "x",
  });
  const [expandedBioIdx, setExpandedBioIdx] = useState<number | null>(null);
  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi);
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <div className={styles.photographersViewCardContainer}>
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
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
                  className={`embla__slide ${styles.photographersViewCard}`}
                  tabIndex={0}
                  aria-label={`Photographer card: ${photographer.name} ${photographer.surname}`}
                >
                  <h3 className={`fancy-link ${styles.authorName}`}>
                    <Link
                      href={`/photographers/${slugify(photographer.surname)}`}
                      tabIndex={0}
                    >
                      {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                    </Link>
                  </h3>
                  <div
                    className={`${
                      photographer
                        ? styles.imageInSlideContainer
                        : styles.imageContainer
                    }`}
                  >
                    {portrait ? (
                      <Link
                        href={`/photographers/${slugify(photographer.surname)}`}
                        className={`no-fancy-link ${styles.authorName}`}
                        tabIndex={0}
                      >
                        <ImageWrapper
                          photographer
                          image={{
                            ...portrait,
                            title: `Portrait of photographer ${photographer.name} ${photographer.surname}`,
                          }}
                          onLoginRequired={onLoginRequired}
                          imgStyleOverride={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                          }}
                          sizes="(max-width: 600px) 90vw, (max-width: 1200px) 50vw, 575px"
                        />
                      </Link>
                    ) : (
                      <Image
                        src="/favicons/android-chrome-512x512.png"
                        alt={`Portrait of photographer ${photographer.name} ${photographer.surname} (not available)`}
                        width={400}
                        height={500}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "auto",
                        }}
                        priority
                      />
                    )}
                  </div>

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
                    <Dropdown
                      buttonText="Prints & books"
                      items={parsedStores}
                    />
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
        {/* Arrow Navigation */}
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            selected={index === selectedIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotographersViewCard;
