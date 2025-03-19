import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { ImageData, ImageCardProps } from "@/types";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import styles from "./ImageCard.module.css";
import { getImageDimensions } from "@/helpers/imageHelpers";

// Image list to show when isMosaic is true

const ImageCard: React.FC<ImageCardProps> = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // const ITEMS_PER_PAGE = 50;

    const fetchImages = async (): Promise<void> => {
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

      // .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      if (error) {
        setError(error.message);
      }

      if (!images) {
        setError("No images found");
        return;
      }

      const processedImages = await Promise.all(
        images.map(async (image): Promise<ImageData> => {
          try {
            const encodedUrl = encodeURI(image.url);
            const dimensions = await getImageDimensions(encodedUrl);
            // console.log({ encodedUrl, dimensions });

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
    };

    fetchImages();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Gallery withCaption>
      {images.map((image, index) => {
        console.log("image-data-fetched", { image });

        return (
          <div
            key={index}
            className={`${styles.imageCard} ${
              image.width > image.height ? styles.landscape : styles.portrait
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
  );
};

export default ImageCard;
