import React, { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { ImageData, ImageCardProps } from "@/types";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import styles from "./ImageCard.module.css";
import { getImageDimensions } from "@/helpers/imageHelpers";
import { ClimbingBoxLoader } from "react-spinners";

// Image Gallery to show when isMosaic is true

const ImageCard: React.FC<ImageCardProps> = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      setLoading(true);

      const { data: images, error } = await supabase.from("images").select(
        `
      id,
      url,
      author,
      title,
      description,
      created_at
      `
      );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!images) {
        setError("No images found");
        setLoading(false);
        return;
      }

      const processedImages = await Promise.all(
        images.map(async (image): Promise<ImageData> => {
          try {
            const encodedUrl = encodeURI(image.url);
            const dimensions = await getImageDimensions(encodedUrl);

            return {
              ...image,
              url: encodedUrl, // Use encoded URL
              width: dimensions.width,
              height: dimensions.height,
              className:
                dimensions.width > dimensions.height
                  ? styles.landscape
                  : styles.portrait,
            };
          } catch (dimensionError) {
            if (dimensionError instanceof Error) {
              console.error(
                "Error getting image dimensions:",
                dimensionError.message
              );
            } else {
              console.error("Error getting image dimensions:", dimensionError);
            }
            return {
              ...image,
              width: 0,
              height: 0,
              className: "",
            } as ImageData;
          }
        })
      );

      const shuffledImages = processedImages.sort(() => Math.random() - 0.5);

      setImages(shuffledImages);
      setLoading(false);
    };

    fetchImages();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {loading ? (
        <div className={styles.loaderContainer}>
          <ClimbingBoxLoader
            color="var(--secondary-color)"
            loading={loading}
            size={25}
          />
          <p className={styles.loaderText}>Loading images...</p>
        </div>
      ) : (
        <Gallery withCaption>
          {images.map((image, index) => {
            return (
              <div
                key={index}
                className={`${styles.imageCard} ${
                  image.width > image.height
                    ? styles.landscape
                    : styles.portrait
                }`}
              >
                <Item
                  original={image.url}
                  thumbnail={image.url}
                  caption={image.author}
                  width={image.width}
                  height={image.height}
                >
                  {({ ref, open }) => (
                    <div ref={ref} onClick={open} className={styles.imageItem}>
                      <Image
                        src={image.url}
                        alt={image.title || "Mosaic Nude Gallery Image"}
                        className={styles.image}
                        fill
                        sizes="(max-width: 600px) 100vw, 50vw"
                        loading="lazy"
                        unoptimized
                      />
                      <div className={styles.imageInfo}>
                        <h3 className={styles.imageText}>{image.author}</h3>
                        {/* <p className={styles.imageDescription}>
                          {image.description}
                        </p> */}
                      </div>
                    </div>
                  )}
                </Item>
                {/* <div>
                  <h3 className={styles.imageTitle}>{image.author}</h3>
                  <p className={styles.imageDescription}>{image.description}</p>
                </div> */}
              </div>
            );
          })}
        </Gallery>
      )}
    </>
  );
};

export default ImageCard;
