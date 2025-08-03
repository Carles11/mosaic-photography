import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ImageCardProps, ImageWithOrientation } from "@/types";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import styles from "./ImageCard.module.css";

const ImageCard: React.FC<ImageCardProps> = ({ onLoginRequired }) => {
  const [images, setImages] = useState<ImageWithOrientation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      setLoading(true);

      const { data: images, error } = await supabase.from("images").select(
        `
          id, url, author, title, description, created_at, orientation
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

      // Add mosaic logic for more dynamic gallery layout
      const processedImages: ImageWithOrientation[] = filteredImages.map(
        (img, index) => {
          let mosaicType: "normal" | "large" | "wide" | "tall" = "normal";

          // Create mosaic variations with better distribution
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
            // Use the orientation from the database or default to "vertical" if not available
            orientation: img.orientation || "vertical",
            mosaicType,
          };
        },
      );

      setImages(processedImages.sort(() => Math.random() - 0.5)); // Shuffle images
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
        ClimbBoxLoaderContainer("var(--text-color)", 16, loading)
      ) : (
        <>
          {/* Add structured data for the image gallery */}
          <JsonLdSchema
            type="ImageGallery"
            name="Mosaic Photography Gallery"
            description="A curated collection of high-quality vintage photography from our archives"
            images={images.map((image) => ({
              contentUrl: image.url,
              name: image.title || "Untitled Image",
              description:
                image.description ||
                "Vintage photography from Mosaic's archives",
              creditText: image.author || "Unknown Photographer",
              width: typeof image.width === "number" ? image.width : 1200,
              height: typeof image.height === "number" ? image.height : 800,
              encodingFormat:
                image.url.endsWith(".jpg") || image.url.endsWith(".jpeg")
                  ? "image/jpeg"
                  : image.url.endsWith(".png")
                    ? "image/png"
                    : "image/jpeg",
              license: "https://creativecommons.org/publicdomain/mark/1.0/",
              acquireLicensePage: "https://www.mosaic.photography/license",
            }))}
          />

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

              if (image.orientation === "horizontal") {
                cssClass += ` ${styles.landscape}`;
              } else if (image.orientation === "vertical") {
                // Vertical image - check for mosaic type (only for vertical images)
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
              } else if (image.orientation === "square") {
                // If we need to add special handling for square images in the future
                cssClass += ` ${styles.portrait}`; // For now, use portrait style for square
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
