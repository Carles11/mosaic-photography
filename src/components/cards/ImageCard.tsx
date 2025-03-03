import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ImageCard.module.css";
import { getImageDimensions } from "@/helpers/imageHelpers";
import { supabase } from "@/lib/supabaseClient";
import ImageGalleryModal from "@/components/modals/imageGallery/ImageGalleryModal";

interface Image {
  id: string;
  url: string;
  author: string;
  title: string | null;
  description: string;
  created_at: string;
  className?: string;
}

const ImageCard: React.FC = () => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [galleryImages, setGalleryImages] = useState<
    { original: string; thumbnail: string }[]
  >([]);
  const [startIndex, setStartIndex] = useState(0);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.currentTarget as HTMLImageElement;
    console.error("Error loading image:", target.src); // Log error with more details
    target.src = "/images/default-BG-image.png"; // Fallback image
  };

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.currentTarget as HTMLImageElement;
    console.log("Image loaded successfully:", target.src); // Log success with more details
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data: images, error } = await supabase
          .from("images")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Error fetching images: ${error.message}`);
        }

        const processedImages = await Promise.all(
          images.map(async (image) => {
            try {
              const encodedUrl = encodeURI(image.url);
              const dimensions = await getImageDimensions(encodedUrl);
              return {
                ...image,
                url: encodedUrl, // Use encoded URL
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
                console.error(
                  "Error getting image dimensions:",
                  dimensionError
                );
              }
              return { ...image, className: "" };
            }
          })
        );

        setImages(processedImages);

        const galleryImagesData = processedImages.map((image) => ({
          original: image.url,
          thumbnail: image.url,
        }));
        setGalleryImages(galleryImagesData);
      } catch (fetchError) {
        if (fetchError instanceof Error) {
          console.error("Error fetching images:", fetchError.message);
        } else {
          console.error("Error fetching images:", fetchError);
        }
      }
    };

    fetchImages();
  }, []);

  const handleImageClick = (index: number) => {
    setStartIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const shuffledImages = images.sort(() => Math.random() - 0.5);

  return (
    <>
      {shuffledImages.map((image, index) => (
        <div
          key={image.id}
          className={`${styles.galleryGridItem} ${image.className}`}
          style={{ height: "200px", position: "relative" }} // Added position: relative
          onClick={() => handleImageClick(index)}
        >
          <div
            className={styles.imageCard}
            style={{ position: "relative", width: "100%", height: "100%" }} // Ensure alt property is set
          >
            <Image
              src={image.url}
              alt={image.title || "Image"} // Ensure alt property is set to a non-null value
              fill
              className={styles.image} // Ensure className is set
              sizes="(max-width: 600px) 100vw, 50vw" // Add sizes prop
              placeholder="blur"
              blurDataURL={"/images/default-BG-image.png"}
              onError={handleImageError} // Use handleImageError for fallback
              onLoad={handleImageLoad} // Log success
            />
            <div className={styles.imageInfo}>
              <p className={styles.imageText}>{image.author}</p>
            </div>
          </div>
        </div>
      ))}
      {isGalleryOpen && (
        <ImageGalleryModal
          images={galleryImages}
          startIndex={startIndex}
          onClose={closeGallery}
          play={true}
          bullets={false}
          fullscreen={true}
        />
      )}
    </>
  );
};

export default ImageCard;
