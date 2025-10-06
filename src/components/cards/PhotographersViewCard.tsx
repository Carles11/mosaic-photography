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
    skipSnaps: true,
    align: "start",
    dragFree: false,
    axis: "x",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    duration: 55,
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
                  <div className={styles.imageContainer}>
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
                            url:
                              portrait.s3Progressive?.[0]?.url ??
                              "/favicons/android-chrome-512x512.png",
                          }}
                          onLoginRequired={onLoginRequired}
                          imgStyleOverride={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                          }}
                          sizes="
                            (max-width: 400px) 90vw,
                            (max-width: 600px) 95vw,
                            (max-width: 900px) 800px,
                            (max-width: 1200px) 1200px,
                            1600px
                          "
                          width={600} // matches S3 bucket and card aspect
                          height={750}
                        />
                      </Link>
                    ) : (
                      <Link
                        href={`/photographers/${slugify(photographer.surname)}`}
                        className={`no-fancy-link ${styles.authorName}`}
                        tabIndex={0}
                      >
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
                      </Link>
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
                </div>
              );
            })
          ) : (
            <div>No photographers found.</div>
          )}
        </div>
        <div className={styles.embla__navigation}>
          {/* Arrow Navigation */}
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
          {/* Dot Navigation */}
          <div className={styles.embla__navigation__dots}>
            {scrollSnaps.map((_, index) => (
              <DotButton
                key={index}
                onClick={() => onDotButtonClick(index)}
                selected={index === selectedIndex}
                label={photographersProp?.[index]?.surname || ""}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotographersViewCard;
