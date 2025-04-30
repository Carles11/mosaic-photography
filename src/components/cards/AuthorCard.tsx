import React, { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Photographer, ImageData, AuthorCardProps } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { GalleryProps } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { ClimbingBoxLoader } from "react-spinners";

import styles from "./AuthorCard.module.css";
// Dynamically import the Gallery and Item components
const Gallery = dynamic(
  () => import("react-photoswipe-gallery").then((mod) => mod.Gallery),
  {
    ssr: false, // Disable server-side rendering for this component
  }
);
const Item = dynamic(
  () => import("react-photoswipe-gallery").then((mod) => mod.Item),
  {
    ssr: false,
  }
);

// Author list to show when isMosaic is false

const AuthorCard: React.FC<AuthorCardProps> = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);

  const galleryOptions: GalleryProps["options"] = {
    zoom: true,
  };

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
      setLoading(true);

      const { data: photographers } = await supabase
        .from("photographers")
        .select(
          `
        name,
        surname,
        author,
        biography,
        birthdate,
        deceasedate,
        origin,
        images (
          id,
          url,
          author,
          title
        )
      `
        )
        .limit(10); // Fetch only 10 photographers initially

      if (!photographers) {
        setLoading(false);
      } else {
        setPhotographers(photographers as Photographer[]);
        setLoading(false);
      }
    };

    fetchPhotographersWithImages();
  }, []);

  const shuffledPhotographers = useMemo(() => {
    return photographers.sort(() => Math.random() - 0.5);
  }, [photographers]);

  // Helper function to encode URIs
  // const getEncodedURI = (url: string) => encodeURI(url);

  const ImageItem: React.FC<{ image: ImageData }> = ({ image }) => {
    const [orientationClass, setOrientationClass] = useState("");
    const imgRef = useRef<HTMLImageElement | null>(null);

    const handleLoad = () => {
      if (imgRef.current) {
        const { naturalWidth, naturalHeight } = imgRef.current;
        const isLandscape = naturalWidth > naturalHeight;
        setOrientationClass(isLandscape ? styles.landscape : styles.portrait);
      }
    };

    return (
      <Item
        original={image.url}
        thumbnail={image.url}
        caption={image.author}
        width={imgRef.current?.naturalWidth || 1200} // Set default width
        height={imgRef.current?.naturalHeight || 800} // Set default height
      >
        {({ ref, open }) => (
          <div ref={ref} onClick={open} className={styles.imageItem}>
            <Image
              src={image.url}
              alt={image.title || `Work of the photographer ${image.author}`}
              width={50}
              height={50}
              className={`${styles.image} ${orientationClass}`}
              priority={false} // Set to true for critical images
              loading="lazy"
              unoptimized
              ref={(node) => {
                if (node) imgRef.current = node;
              }}
              onLoad={() => handleLoad()}
            />
          </div>
        )}
      </Item>
    );
  };

  const handleNameClick = useMemo(() => {
    return (photographer: Photographer) => {
      setSelectedPhotographer(photographer);
    };
  }, []);

  const debouncedScrollIntoView = useMemo(() => {
    let timeout: NodeJS.Timeout | null = null;
    return (id: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };
  }, []);

  const closePhotographerModal = () => {
    setSelectedPhotographer(null);
  };

  return (
    <div>
      {loading ? (
        <div className={styles.loaderContainer}>
          <ClimbingBoxLoader
            color="var(--color-white)"
            loading={loading}
            size={25}
          />
          <p className={styles.loaderText}>Loading photographers...</p>
        </div>
      ) : (
        <>
          <div className={styles.authorScrollList}>
            {shuffledPhotographers.map((photographer, index) => (
              <button
                key={index}
                className={styles.authorButton}
                onClick={() => debouncedScrollIntoView(`author-${index}`)}
              >
                {photographer.author}
              </button>
            ))}
          </div>
          {shuffledPhotographers.map((photographer, index) => (
            <div
              key={index}
              id={`author-${index}`}
              className={styles.authorCard}
            >
              <div onClick={() => handleNameClick(photographer)}>
                <h2 className={styles.authorName}>
                  {`${photographer.name} ${photographer.surname}`.toUpperCase()}
                </h2>
                <p className={styles.biography}>
                  {photographer.biography || "No biography available."}
                </p>
                <p>
                  <strong>Birthdate: </strong>
                  {new Date(photographer.birthdate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Origin:</strong> {photographer.origin}
                </p>
                {photographer.deceasedate && (
                  <p>
                    <strong>Deceasedate:</strong>{" "}
                    {new Date(photographer.deceasedate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Gallery withCaption options={galleryOptions}>
                <div className={styles.imageList}>
                  {photographer.images.map((image, index) => (
                    <ImageItem key={index} image={image} />
                  ))}
                </div>
              </Gallery>
            </div>
          ))}
        </>
      )}
      {selectedPhotographer && (
        <PhotographerModal
          photographer={selectedPhotographer}
          onClose={closePhotographerModal}
        />
      )}
    </div>
  );
};

export default AuthorCard;
