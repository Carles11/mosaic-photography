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
import { formatHumanDate } from "@/helpers/dates";
import { Photographer } from "@/types/gallery";
import styles from "./PhotographersViewCard.module.css";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

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

  const getCleanIntro = (intro_md: string) => {
    if (!intro_md) return "";

    // 1. More robust Header removal
    // This looks for a line starting with one or more '#' symbols,
    // followed by space, then the rest of the text on that line.
    // It handles both standard \n and Windows \r\n line endings.
    let cleanText = intro_md.replace(/^#+.*(\r\n|\r|\n)/, "");

    // 2. Safely strip the GEO/AI section if it exists
    const footerMarker = "#### 🔍 AI-Search & GEO Context";

    if (cleanText.includes(footerMarker)) {
      cleanText = cleanText.split(footerMarker)[0];
    }

    // 3. Trim extra whitespace
    return cleanText.trim();
  };
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
                      console.log("Rendering store", { store });

                      return {
                        store: String(store.store),
                        website: String(store.website),
                        affiliate: Boolean(store.affiliate),
                        description: String(store.description),
                      };
                    } catch {
                      return null;
                    }
                  })
                  .filter((item): item is DropdownItem => item !== null)
                  .filter((item) => item.store !== "Fine Art America");
              }
              return (
                <div
                  key={photographer.surname + idx}
                  className={`embla__slide ${styles.photographersViewCard}`}
                  tabIndex={0}
                  aria-label={`Photographer card: ${photographer.name} ${photographer.surname}`}
                >
                  <Link
                    href={`/photographers/${slugify(photographer.surname)}`}
                    tabIndex={0}
                  >
                    <h3 className={`fancy-link ${styles.authorName}`}>
                      {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                    </h3>
                  </Link>

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
                          sizes="(max-width: 400px) 90vw, (max-width: 600px) 95vw, (max-width: 900px) 800px, (max-width: 1200px) 1200px, 1600px"
                          width={600}
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

                  <p className={styles.lifespan}>
                    <time dateTime={photographer.birthdate ?? undefined}>
                      {formatHumanDate(photographer.birthdate)}
                    </time>
                    {" – "}
                    <time dateTime={photographer.deceasedate ?? undefined}>
                      {formatHumanDate(photographer.deceasedate)}
                    </time>
                  </p>

                  {photographer.origin && (
                    <p className={styles.origin}>
                      Born in {photographer.origin}
                    </p>
                  )}

                  {photographer.intro_md && (
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
                      <ReactMarkdown
                        components={{
                          p: (props) => <span {...props} />,
                          strong: (props) => <strong {...props} />,
                        }}
                      >
                        {getCleanIntro(photographer.intro_md)}
                      </ReactMarkdown>
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
