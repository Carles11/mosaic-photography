import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ImageCardProps, ImageWithOrientation } from "@/types";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import styles from "./ImageCard.module.css";

const ImageCard: React.FC<ImageCardProps> = ({ onLoginRequired }) => {
  const [images, setImages] = useState<ImageWithOrientation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orientationsLoading, setOrientationsLoading] = useState<Set<string>>(
    new Set(),
  );

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Pre-load image dimensions to determine orientation
  const loadImageDimensions = (
    imageUrl: string,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageUrl;

      // Add timeout to prevent hanging
      setTimeout(() => {
        reject(new Error("Image load timeout"));
      }, 3000); // Reduced to 3 second timeout
    });
  };

  // Update image orientation after determining it
  const updateImageOrientation = async (imageId: string, imageUrl: string) => {
    if (orientationsLoading.has(imageId)) return; // Already loading

    setOrientationsLoading((prev) => new Set(prev).add(imageId));

    try {
      const dimensions = await loadImageDimensions(imageUrl);
      const orientation =
        dimensions.width > dimensions.height ? "landscape" : "portrait";

      setImages((prevImages) =>
        prevImages.map((img) =>
          img.id === imageId ? { ...img, orientation } : img,
        ),
      );
    } catch (error) {
      console.warn(
        `Failed to determine orientation for image ${imageId}:`,
        error,
      );
      // Keep default portrait orientation
    } finally {
      setOrientationsLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      setLoading(true);

      const { data: images, error } = await supabase.from("images").select(
        `
          id, url, author, title, description, created_at
        `,
      );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!images) {
        setError("No images found.");
        setLoading(false);
        return;
      }

      // Filter out images that start with "000_aaa"
      const filteredImages = images.filter((img) => {
        const fileName = img.url.split("/").pop()?.toLowerCase();
        return !fileName?.startsWith("000_aaa");
      });

      // Initially set all images as portrait to prevent layout shifts
      // Add mosaic logic for more dynamic gallery layout
      const initialImages: ImageWithOrientation[] = filteredImages.map(
        (img, index) => {
          let mosaicType: "normal" | "large" | "wide" | "tall" = "normal";

          // Create mosaic variations for portrait images with better distribution
          // Use different intervals for different mosaic types to create more variety
          const isLargeMosaic = index > 0 && index % 11 === 0; // Every 11th image
          const isWideMosaic = index > 0 && index % 13 === 7; // Every 13th image, offset by 7
          const isTallMosaic = index > 0 && index % 17 === 5; // Every 17th image, offset by 5

          if (isLargeMosaic) {
            mosaicType = "large";
          } else if (isWideMosaic) {
            mosaicType = "wide";
          } else if (isTallMosaic) {
            mosaicType = "tall";
          }

          return {
            ...img,
            orientation: "portrait" as const,
            mosaicType,
          };
        },
      );

      setImages(initialImages.sort(() => Math.random() - 0.5)); // Shuffle images
      setLoading(false);

      // Asynchronously determine actual orientations (without blocking initial render)
      initialImages.forEach((img) => {
        setTimeout(
          () => updateImageOrientation(img.id, img.url),
          Math.random() * 1000,
        );
      });
    };

    fetchImages();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {loading ? (
        ClimbBoxLoaderContainer("var(--text-color)", 16, loading)
      ) : (
        <>
          <PhotoSwipeWrapper
            images={images} // Pass images array to PhotoSwipeWrapper
            onLoginRequired={onLoginRequired}
            galleryOptions={{
              zoom: true,
              maxSpreadZoom: 1,
              fullscreenEl: true,
              bgOpacity: 1,
              wheelToZoom: true,
            }}
          >
            {images.map((image) => {
              // Determine CSS class based on orientation and mosaic type
              let cssClass = styles.gridItem;

              if (image.orientation === "landscape") {
                cssClass += ` ${styles.landscape}`;
              } else {
                // Portrait image - check for mosaic type (only for portrait images)
                switch (image.mosaicType) {
                  case "large":
                    cssClass += ` ${styles.mosaicLarge}`;
                    break;
                  case "wide":
                    cssClass += ` ${styles.mosaicWide}`;
                    break;
                  case "tall":
                    cssClass += ` ${styles.mosaicTall}`;
                    break;
                  default:
                    cssClass += ` ${styles.portrait}`;
                }
              }

              return (
                <div key={image.id} className={cssClass}>
                  <ImageWrapper
                    image={image}
                    imgRef={imgRef}
                    onLoginRequired={onLoginRequired}
                  />
                </div>
              );
            })}
          </PhotoSwipeWrapper>
        </>
      )}
    </>
  );
};

export default ImageCard;
