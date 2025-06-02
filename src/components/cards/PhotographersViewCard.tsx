import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Photographer, PhotographersViewCardProps } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import Slider from "react-slick";
import Lightbox from "react-image-lightbox"; // Import Lightbox
import "react-image-lightbox/style.css"; // Import Lightbox styles

import "slick-carousel/slick/slick.css"; // Import slick-carousel styles
import "slick-carousel/slick/slick-theme.css"; // Import slick-carousel theme
import styles from "./PhotographersViewCard.module.css";
import ImageWrapper from "../wrappers/ImageWrapper";

const PhotographersViewCard: React.FC<PhotographersViewCardProps> = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);
  const [expandedBiography, setExpandedBiography] = useState<number | null>(
    null
  );
  const [expandedOrigin, setExpandedOrigin] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false); // State for Lightbox
  const [lightboxImage, setLightboxImage] = useState<string>(""); // Current image for Lightbox
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
      setLoading(true);

      const { data: photographers } = await supabase
        .from("photographers")
        .select(
          `
          name, surname, author, biography, birthdate, deceasedate, origin, website, store, instagram,
          images (id, url, author, title, description, created_at)
        `
        )
        .limit(10);

      setPhotographers(photographers || []);
      setLoading(false);
    };

    fetchPhotographersWithImages();
  }, []);

  const toggleBiography = (index: number) => {
    setExpandedBiography((prev) => (prev === index ? null : index));
  };

  const toggleOrigin = (index: number) => {
    setExpandedOrigin((prev) => (prev === index ? null : index));
  };

  const mainSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    appendDots: (dots) => (
      <div
        style={{
          backgroundColor: "#ddd",
          borderRadius: "10px",
          padding: "10px",
        }}
      >
        <ul
          style={{
            margin: "0px",
            padding: "0",
            display: "flex",
            justifyContent: "center",
            overflowX: "auto", // Enable horizontal scrolling
            whiteSpace: "nowrap", // Prevent line breaks
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
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#888",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  whiteSpace: "nowrap", // Prevent text wrapping
                }}
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
    centerMode: true,
    autoplaySpeed: 2000,
    swipeToSlide: true,
  };

  return (
    <div className={styles.photographersViewCardContainer}>
      {loading ? (
        ClimbBoxLoaderContainer("var(--color-white)", 25, loading)
      ) : (
        <Slider {...mainSliderSettings}>
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
              <Slider {...nestedSliderSettings}>
                {photographer.images.map((image) => (
                  <div key={image.id} className={styles.imageContainer}>
                    <ImageWrapper
                      image={image}
                      imgRef={imgRef}
                      onImageClick={() => {
                        setLightboxImage(image.url);
                        setLightboxOpen(true);
                      }}
                    />
                  </div>
                ))}
              </Slider>
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
            </div>
          ))}
        </Slider>
      )}
      {selectedPhotographer && (
        <PhotographerModal
          photographer={selectedPhotographer}
          onClose={() => setSelectedPhotographer(null)}
        />
      )}
      {lightboxOpen && (
        <Lightbox
          mainSrc={lightboxImage}
          onCloseRequest={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default PhotographersViewCard;
