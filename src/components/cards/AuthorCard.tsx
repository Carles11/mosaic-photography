import React, { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Photographer, ImageData, AuthorCardProps } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { Gallery, Item, GalleryProps } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { getImageDimensions } from "@/helpers/imageHelpers";
import { ClimbingBoxLoader } from "react-spinners";

import styles from "./AuthorCard.module.css";

// Author list to show when isMosaic is false

const AuthorCard: React.FC<AuthorCardProps> = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);

  const galleryOptions: GalleryProps["options"] = {
    zoom: true, // Enable zoom functionality
    // initialZoomLevel: 0.8, // Set initial zoom level (e.g., 80% of the image size)
    // maxZoomLevel: 2, // Set maximum zoom level (e.g., 200% of the image size)
  };

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
      setLoading(true);

      const { data: photographers, error } = await supabase.from(
        "photographers"
      ).select(`
        name,
        surname,
        biography,
        birthdate,
        deceasedate,
        origin,
        website,
        instagram,
        store,
        images (
        id,
        url,
        author,
        title,
        description,
        created_at
        )
      `);

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        const shuffledPhotographers = photographers.sort(
          () => Math.random() - 0.5
        );

        setPhotographers(shuffledPhotographers);
        setLoading(false);
      }
    };

    fetchPhotographersWithImages();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleNameClick = (photographer: Photographer) => {
    setSelectedPhotographer(photographer);
  };

  const closePhotographerModal = () => {
    setSelectedPhotographer(null);
  };

  const ImageItem: React.FC<{ image: ImageData }> = ({ image }) => {
    const [dimensions, setDimensions] = useState<{
      width: number;
      height: number;
    } | null>(null);

    useEffect(() => {
      const fetchDimensions = async () => {
        try {
          const encodedUrl = encodeURI(image.url);
          console.log({ encodedUrl });
          console.log("image.url", image.url);
          const dims = await getImageDimensions(image.url);

          setDimensions(dims);
        } catch (dimensionError) {
          if (dimensionError instanceof Error) {
            console.log(
              "Failed getting image dimensions:",
              dimensionError.message
            );
          } else {
            console.log("Failed getting image dimensions:", dimensionError);
          }
        }
      };

      fetchDimensions();
    }, [image.url]);

    if (!dimensions) {
      return null;
    }

    return (
      <Item
        original={encodeURI(image.url)}
        thumbnail={encodeURI(image.url)}
        caption={image.author}
        width={dimensions.width}
        height={dimensions.height}
      >
        {({ ref, open }) => (
          <div ref={ref} onClick={open} className={styles.imageItem}>
            <Image
              src={encodeURI(image.url)}
              alt={image.title || `Work of the photographer ${image.author}`}
              width={50}
              height={50}
              className={
                dimensions.width > dimensions.height
                  ? styles.landscape
                  : styles.portrait
              }
              loading="lazy"
              unoptimized
            />
          </div>
        )}
      </Item>
    );
  };

  return (
    // <div className={styles.authorCardContainer}>
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
        photographers.map((photographer, index) => (
          <div key={index} className={styles.authorCard}>
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
        ))
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
