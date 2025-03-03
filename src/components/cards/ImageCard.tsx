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
  title: string;
  description: string;
  created_at: string;
  className?: string;
}

const ImageCard: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [galleryImages, setGalleryImages] = useState<
    { original: string; thumbnail: string }[]
  >([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  console.log({ isGalleryOpen });
  useEffect(() => {
    const fetchImages = async () => {
      const { data: images, error } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching images:", error);
      else {
        const processedImages = await Promise.all(
          images.map(async (image) => {
            const dimensions = await getImageDimensions(image.url);
            return {
              ...image,
              className:
                dimensions.width > dimensions.height
                  ? styles.landscape
                  : styles.portrait,
            };
          })
        );
        setImages(processedImages);
        setGalleryImages(
          processedImages.map((image) => ({
            original: image.url,
            thumbnail: image.url,
          }))
        );
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

  return (
    <>
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`${styles.galleryGridItem} ${image.className}`}
          style={{ height: "200px" }}
          onClick={() => handleImageClick(index)}
        >
          <div className={styles.imageCard}>
            <Image
              src={image.url}
              alt={image.title}
              layout="fill"
              className={styles.image}
              placeholder="blur"
              blurDataURL={"/images/default-BG-image.png"}
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
