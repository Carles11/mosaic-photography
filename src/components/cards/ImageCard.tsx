import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./ImageCard.module.css";
import { getImageDimensions } from "@/helpers/imageHelpers";
import { supabase } from "@/lib/supabaseClient";

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
      }
    };

    fetchImages();
  }, []);

  return (
    <>
      {images.map((image) => (
        <div
          key={image.id}
          className={`${styles.galleryGridItem} ${image.className}`}
          style={{ height: "200px" }}
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
    </>
  );
};

export default ImageCard;
