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
}

const ImageCard: React.FC<{ image: Image }> = ({ image }) => {
  console.log({ image });

  return (
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
  );
};

export default ImageCard;
