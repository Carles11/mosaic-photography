import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Photographer } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import Slider, { Settings } from "react-slick";

import PhotoSwipeWrapper, {
  Item,
} from "@/components/wrappers/PhotoSwipeWrapper";

import "slick-carousel/slick/slick.css"; // Import slick-carousel styles
import "slick-carousel/slick/slick-theme.css"; // Import slick-carousel theme
import styles from "./PhotographersViewCard.module.css";
import ImageWrapper from "../wrappers/ImageWrapper";

const PhotographersViewCard = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);
  const [expandedBiography, setExpandedBiography] = useState<number | null>(
    null
  );

  const [expandedOrigin, setExpandedOrigin] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
      setLoading(true);

      const { data: photographers, error } = await supabase
        .from("photographers")
        .select(
          `
          name, surname, author, biography, birthdate, deceasedate, origin, website, store, instagram,
          images (id, url, author, title, description, created_at)
        `
        )
        .limit(10);

      if (error) {
        setError(error.message);

        setLoading(false);
        return;
      }

      if (!photographers) {
        setError("No images found.");

        setLoading(false);
        return;
      }

      setPhotographers(photographers || []);
      setLoading(false);
    };

    fetchPhotographersWithImages();
  }, []);

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
      {loading ? (
        ClimbBoxLoaderContainer("var(--text-color)", 16, loading)
      ) : (
        <PhotoSwipeWrapper
          galleryOptions={{
            zoom: true,
            maxSpreadZoom: 1,
            fullscreenEl: true,
            bgOpacity: 1,
            wheelToZoom: true,
          }}
        >
          <SliderTyped {...mainSliderSettings}>
            {photographers.map((photographer, index) => (
              <div
                key={index}
                id={`author-${index}`}
                className={styles.photographersViewCard}
              >
                <h3
                  className={`fancy-link ${styles.authorName}`}
                  onClick={() => setSelectedPhotographer(photographer)}
                  role="button"
                  tabIndex={0}
                >
                  {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                </h3>
                <SliderTyped {...nestedSliderSettings}>
                  {photographer.images.map((image) => (
                    <div key={image.id} className={styles.imageContainer}>
                      <ImageWrapper image={image} imgRef={imgRef} />
                    </div>
                  ))}
                </SliderTyped>
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
                    {new Date(photographer.deceasedate).toLocaleDateString()}
                  </p>
                )}
                <p
                  className={`fancy-link ${styles.authorCTA}`}
                  onClick={() => setSelectedPhotographer(photographer)}
                  role="button"
                  tabIndex={0}
                >
                  Dive Into {photographer.surname}’s Art
                </p>
              </div>
            ))}
          </SliderTyped>
        </PhotoSwipeWrapper>
      )}
      {selectedPhotographer && (
        <PhotographerModal
          photographer={selectedPhotographer}
          onClose={() => setSelectedPhotographer(null)}
        />
      )}
    </div>
  );
};

export default PhotographersViewCard;
