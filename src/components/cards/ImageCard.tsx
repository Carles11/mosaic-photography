import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { ImageData, ImageCardProps } from "@/types";
import { GalleryProps } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import styles from "./ImageCard.module.css";
import { getImageDimensions } from "@/helpers/imageHelpers";
import { ClimbingBoxLoader } from "react-spinners";

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

const ImageCard: React.FC<ImageCardProps> = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const galleryOptions: GalleryProps["options"] = {
    zoom: true,
  };

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
            // const encodedUrl = encodeURI(image.url);
            const dimensions = await getImageDimensions(image.url);

            return {
              ...image,
              url: image.url, // Use encoded URL
              width: dimensions.width,
              height: dimensions.height,
              className:
                dimensions.width > dimensions.height
                  ? styles.landscape
                  : styles.portrait,
            };
          } catch (dimensionError) {
            if (dimensionError instanceof Error) {
              console.log(
                "Failed getting image dimensions:",
                dimensionError.message
              );
            } else {
              console.log("Failed getting image dimensions:", dimensionError);
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
            color="var(--color-white)"
            loading={loading}
            size={25}
          />
          <p className={styles.loaderText}>Loading images...</p>
        </div>
      ) : (
        <Gallery withCaption options={galleryOptions}>
          {images.map((image, index) => {
            if (!image.width || !image.height) {
              // Skip rendering if dimensions are missing
              return null;
            }
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
                  width={image.width || 0} // Fallback to a default width (e.g., 800px)
                  height={image.height || 0} // Fallback to a default height (e.g., 600px)
                >
                  {({ ref, open }) => (
                    <div ref={ref} onClick={open} className={styles.imageItem}>
                      <Image
                        src={image.url}
                        alt={image.title || "Mosaic Gallery Image"}
                        className={styles.image}
                        width={100}
                        height={90}
                        sizes="(max-width: 600px) 100vw, 50vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
                      />
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
