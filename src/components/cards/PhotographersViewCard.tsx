import { useEffect, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import { sendGTMEvent } from "@next/third-parties/google";
import ImageWrapper from "../wrappers/ImageWrapper";
import styles from "./PhotographersViewCard.module.css";
import GallerySkeletonCard from "./GallerySkeletonCard";
import "./PhotographersViewCard.overlay.css";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";

import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import Dropdown from "@/components/inputs/dropDown";
import JsonLdSchema from "@/components/seo/JsonLdSchema";

import "slick-carousel/slick/slick.css"; // Import slick-carousel styles
import "../../../public/css/slick-theme-custom.css";

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
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkOverlay = () => {
        setShowOverlay(Boolean(window.__AGE_CONSENT_OPEN__));
      };
      checkOverlay();
      window.addEventListener("age-consent-toggle", checkOverlay);
      return () => {
        window.removeEventListener("age-consent-toggle", checkOverlay);
      };
    }
  }, []);

  // SSR/SSG: use prop; fallback to client fetch only if not provided (e.g. for refresh/filter)
  const [photographers] = useState<Photographer[]>(photographersProp || []);
  const error = null;
  const loading = !photographersProp;
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);
  const [expandedBiography, setExpandedBiography] = useState<number | null>(
    null,
  );
  const [expandedOrigin, setExpandedOrigin] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Only allow client fetch for user-triggered refresh/filter, not initial load
  // Remove initial useEffect data load for SSR

  if (error) {
    return <div>Error: {error}</div>;
  }

  const toggleBiography = (index: number) => {
    setExpandedBiography((prev) => (prev === index ? null : index));
  };

  const toggleOrigin = (index: number) => {
    setExpandedOrigin((prev) => (prev === index ? null : index));
  };

  const mainSliderSettings = {
    dots: true,
    infinite: true,
    arrows: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1025,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 769,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],

    // @ts-expect-error: Should expect react-slick element
    appendDots: (dots) => (
      <div
        style={{
          display: "flex",
          overflowX: "auto" /* Enable horizontal scrolling */,
          overflowY: "hidden" /* Hide vertical scrolling */,
          whiteSpace: "nowrap" /* Prevent wrapping of list items */,
          scrollbarWidth: "none" /* Hide scrollbar in Firefox */,
          msOverflowStyle: "none" /* Hide scrollbar in IE and Edge */,
          backgroundColor: "#ddd",
          borderRadius: "10px",
        }}
      >
        <ul
          style={{
            display: "flex",
            margin: 0,
            padding: 0,
            listStyle: "none",
            whiteSpace: "nowrap",
            width: "100vw",
          }}
        >
          {photographers.map((photographer, index) => (
            <li
              key={index}
              style={{
                margin: "0 5px",
                display: "inline-block",
                listStyle: "none",
              }}
            >
              <button
                className="photographer-list-button"
                onClick={() => {
                  const targetDot =
                    dots[index]?.props?.children?.props?.onClick;
                  if (typeof targetDot === "function") {
                    targetDot({ preventDefault: () => {} });
                  } else {
                    console.error("Dot click handler is not defined.");
                  }
                }}
              >
                {photographer.surname}
              </button>
            </li>
          ))}
        </ul>
      </div>
    ),
  };

  const nestedSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    centerMode: false,
    autoplaySpeed: 2000,
    swipeToSlide: true,
  };

  const SliderTyped = Slider as unknown as React.ComponentClass<Settings>;

  return (
    <div className={styles.photographersViewCardContainer}>
      {/* Overlay for age consent modal: visually obscure but keep content in DOM */}
      {showOverlay && <div className={styles.overlay} aria-hidden="true" />}
      <div className={showOverlay ? styles.obscuredContent : undefined}>
        {loading ? (
          <div className={styles.photographersViewSkeletonGrid}>
            {Array.from({
              length:
                typeof window !== "undefined" && window.innerWidth <= 576
                  ? 1
                  : 3,
            }).map((_, i) => (
              <GallerySkeletonCard
                key={i}
                imageHeight={220}
                textLines={1}
                shortText
              />
            ))}
          </div>
        ) : (
          <>
            {/* Add structured data for photographers and their images */}
            {photographers && photographers.length > 0 ? (
              photographers.map((photographer) => (
                <JsonLdSchema
                  key={`schema-${photographer.surname}`}
                  type="ImageGallery"
                  name={`${photographer.name} ${photographer.surname} Photography Collection`}
                  description={
                    photographer.biography ||
                    `Photography collection by ${photographer.name} ${photographer.surname}`
                  }
                  images={photographer.images.map((image) => ({
                    contentUrl: image.url,
                    name: image.title || `Image by ${photographer.surname}`,
                    description:
                      image.description ||
                      `Vintage photography by ${photographer.name} ${photographer.surname}`,
                    creditText: photographer.name + " " + photographer.surname,
                    width: typeof image.width === "number" ? image.width : 1200,
                    height:
                      typeof image.height === "number" ? image.height : 800,
                    encodingFormat:
                      image.url.endsWith(".jpg") || image.url.endsWith(".jpeg")
                        ? "image/jpeg"
                        : image.url.endsWith(".png")
                          ? "image/png"
                          : "image/jpeg",
                    license:
                      "https://creativecommons.org/publicdomain/mark/1.0/",
                    acquireLicensePage:
                      "https://www.mosaic.photography/license",
                  }))}
                />
              ))
            ) : (
              <div>No photographers found.</div>
            )}

            <SliderTyped {...mainSliderSettings}>
              {photographers &&
                photographers.length > 0 &&
                photographers.map((photographer, index) => (
                  <div
                    key={index}
                    id={`author-${index}`}
                    className={styles.photographersViewCard}
                  >
                    <h3
                      className={`fancy-link ${styles.authorName}`}
                      onClick={() => {
                        setSelectedPhotographer(photographer);
                        sendGTMEvent({
                          event: "photographerSelected-top",
                          value: photographer.surname,
                        });
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                    </h3>
                    <PhotoSwipeWrapper
                      images={photographer.images} // Pass photographer's images array
                      onLoginRequired={onLoginRequired}
                      galleryOptions={{
                        zoom: true,
                        initialZoomLevel: "fill",
                        secondaryZoomLevel: 1,
                        maxZoomLevel: 2,
                        fullscreenEl: true,
                        bgOpacity: 1,
                      }}
                    >
                      <SliderTyped {...nestedSliderSettings}>
                        {photographer.images.map((image) => (
                          <div key={image.id} className={styles.imageContainer}>
                            <ImageWrapper
                              image={image}
                              imgRef={imgRef}
                              onLoginRequired={onLoginRequired}
                            />
                          </div>
                        ))}
                      </SliderTyped>
                    </PhotoSwipeWrapper>
                    <p
                      className={`${styles.biography} ${
                        expandedBiography === index ? styles.expanded : ""
                      }`}
                      onClick={() => toggleBiography(index)}
                    >
                      <strong>Biography: </strong>
                      <br />
                      {photographer.biography || "No biography available."}
                    </p>
                    <p>
                      <strong>Birthdate: </strong>
                      {new Date(photographer.birthdate).toLocaleDateString()}
                    </p>
                    <p
                      className={`${styles.origin} ${
                        expandedOrigin === index ? styles.expanded : ""
                      }`}
                      onClick={() => toggleOrigin(index)}
                    >
                      <strong>Origin:</strong> {photographer.origin}
                    </p>
                    {photographer.deceasedate && (
                      <p>
                        <strong>Deceasedate:</strong>{" "}
                        {new Date(
                          photographer.deceasedate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                    <p
                      className={`fancy-link ${styles.authorCTA}`}
                      onClick={() => {
                        setSelectedPhotographer(photographer);
                        sendGTMEvent({
                          event: "photographerSelected-bottom",
                          value: photographer.surname,
                        });
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      Dive Into {photographer.surname}’s Art
                    </p>
                    {/* Add Make it yours Dropdown below */}
                    {photographer.store &&
                      photographer.store.length > 0 &&
                      (() => {
                        // Parse stores as in PhotographerModal
                        const parsedStores = photographer.store
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
                          .filter(
                            (
                              item,
                            ): item is {
                              store: string;
                              website: string;
                              affiliate: boolean;
                            } => item !== null,
                          );
                        return parsedStores.length > 0 ? (
                          <div style={{ marginTop: 8 }}>
                            <Dropdown
                              buttonText="Make it yours"
                              items={parsedStores}
                              onToggle={() => {
                                sendGTMEvent({
                                  event: "HOME-storesDropdownOpened",
                                  value: photographer.name,
                                });
                              }}
                            />
                          </div>
                        ) : null;
                      })()}
                  </div>
                ))}
            </SliderTyped>
          </>
        )}
        {selectedPhotographer && (
          <PhotographerModal
            photographer={selectedPhotographer}
            onClose={() => setSelectedPhotographer(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PhotographersViewCard;
