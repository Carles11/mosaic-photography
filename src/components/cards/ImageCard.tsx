import React from "react";
import Image from "next/image";
import styles from "./ImageCard.module.css";

interface Image {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
  className?: string;
}

const ImageCard: React.FC<{ images: Image[] }> = ({ images }) => {
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
