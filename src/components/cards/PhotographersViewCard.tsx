import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Photographer, PhotographersViewCardProps } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import Slider from "react-slick";

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
    dots: true, // Show navigation dots
    infinite: true, // Enable infinite scrolling
    speed: 500, // Transition speed
    slidesToShow: 3, // Number of items to show at once (default for desktop)
    slidesToScroll: 1, // Number of items to scroll at once
    autoplay: false, // Enable autoplay
    autoplaySpeed: 3000, // Autoplay speed in milliseconds
    pauseOnHover: true, // Pause autoplay on hover
    swipeToSlide: true, // Allow swiping to slide
    responsive: [
      {
        breakpoint: 1024, // For tablets
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768, // For mobile devices
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
    dots: false, // Disable navigation dots for nested slider
    infinite: true, // Enable infinite scrolling
    speed: 500, // Transition speed
    slidesToShow: 1, // Show one image at a time
    slidesToScroll: 1, // Scroll one image at a time
    autoplay: false, // Enable autoplay
    centerMode: true, // Enable centerMode
    autoplaySpeed: 2000, // Autoplay speed in milliseconds
    swipeToSlide: true, // Allow swiping to slide
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
                    <ImageWrapper image={image} />
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
    </div>
  );
};

export default PhotographersViewCard;
