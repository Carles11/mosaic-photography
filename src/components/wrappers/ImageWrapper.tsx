import React from "react";
import Image from "next/image";
import { Item } from "./PhotoSwipeWrapper";
import styles from "./image.module.css";

interface ImageWrapperProps {
  image: {
    url: string;
    author: string;
    title?: string;
  };
  imgRef?: React.RefObject<HTMLImageElement | null>;
  handleLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onImageClick?: () => void; // Add onImageClick prop
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image,
  imgRef,
  handleLoad,
  onImageClick,
}) => {
  return (
    <div className={styles.imageCard}>
      <Item
        original={image.url}
        thumbnail={image.url}
        caption={image.author}
        width={imgRef?.current?.naturalWidth || 300}
        height={imgRef?.current?.naturalHeight || 200}
      >
        {(props) => (
          <div ref={imgRef} onClick={onImageClick} className={styles.imageItem}>
            <Image
              src={image.url}
              alt={image.title || "Gallery Image"}
              className={`${styles.image}`}
              width={imgRef?.current?.naturalWidth || 300}
              height={imgRef?.current?.naturalHeight || 200}
              sizes="(max-width: 600px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
              loading="lazy"
              onLoad={handleLoad}
              ref={imgRef}
            />
          </div>
        )}
      </Item>
    </div>
  );
};

export default ImageWrapper;
