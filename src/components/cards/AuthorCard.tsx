import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Photographer, Image as ImageType } from "@/types";
import PhotographerModal from "@/components/modals/photographer/PhotographerModal";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { getImageDimensions } from "@/helpers/imageHelpers";

import styles from "./AuthorCard.module.css";

type AuthorCardProps = object;

const AuthorCard: React.FC<AuthorCardProps> = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotographer, setSelectedPhotographer] =
    useState<Photographer | null>(null);

  useEffect(() => {
    const fetchPhotographersWithImages = async () => {
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
      } else {
        const processedPhotographers = await Promise.all(
          photographers.map(async (photographer) => {
            const processedImages = await Promise.all(
              photographer.images.map(async (image) => {
                try {
                  const encodedUrl = encodeURI(image.url);
                  const dimensions = await getImageDimensions(encodedUrl);
                  return {
                    ...image,
                    width: dimensions.width,
                    height: dimensions.height,
                  };
                } catch (dimensionError) {
                  if (dimensionError instanceof Error) {
                    console.error(
                      "Error getting image dimensions:",
                      dimensionError.message
                    );
                  } else {
                    console.error(
                      "Error getting image dimensions:",
                      dimensionError
                    );
                  }
                  return { ...image, width: 0, height: 0 };
                }
              })
            );
            return { ...photographer, images: processedImages };
          })
        );
        setPhotographers(processedPhotographers);
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

  const ImageItem: React.FC<{ image: ImageType }> = ({ image }) => {
    const [dimensions, setDimensions] = useState<{
      width: number;
      height: number;
    } | null>(null);

    useEffect(() => {
      const fetchDimensions = async () => {
        try {
          const encodedUrl = encodeURI(image.url);
          const dims = await getImageDimensions(encodedUrl);

          setDimensions(dims);
        } catch (dimensionError) {
          if (dimensionError instanceof Error) {
            console.error(
              "Error getting image dimensions:",
              dimensionError.message
            );
          } else {
            console.error("Error getting image dimensions:", dimensionError);
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
        original={image.url}
        thumbnail={image.url}
        caption={image.author}
        width={dimensions.width}
        height={dimensions.height}
      >
        {({ ref, open }) => (
          <div ref={ref} onClick={open} className={styles.imageItem}>
            <Image
              src={image.url}
              alt={image.title || "Image"}
              width={50}
              height={50}
              className={
                dimensions.width > dimensions.height
                  ? styles.landscape
                  : styles.portrait
              }
            />
          </div>
        )}
      </Item>
    );
  };
  return (
    <div>
      {photographers.map((photographer, index) => (
        <div key={index} className={styles.authorCard}>
          <div onClick={() => handleNameClick(photographer)}>
            <h2 className={styles.authorName}>
              {`${photographer.name} ${photographer.surname}`.toUpperCase()}
            </h2>
            <p>{photographer.biography || "No biography available."}</p>
            <p>
              <strong>Birthdate:</strong>
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
          <Gallery withCaption>
            <div className={styles.imageList}>
              {photographer.images.map((image, index) => (
                <ImageItem key={index} image={image} />
              ))}
            </div>
          </Gallery>
        </div>
      ))}
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
