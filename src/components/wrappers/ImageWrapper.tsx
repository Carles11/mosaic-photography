import React from "react";
import Image from "next/image";
import { Item } from "./PhotoSwipeWrapper"; // Import Item from PhotoSwipeWrapper
import styles from "./image.module.css";

interface ImageWrapperProps {
  image: {
    url: string;
    author: string;
    title?: string;
  };
  imgRef?: React.RefObject<HTMLImageElement | null>; // Add imgRef property
  handleLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void; // Updated parameter name
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image,
  imgRef,
  handleLoad,
}) => {
  return (
    <div className={styles.imageCard}>
      <Item
        original={image.url}
        thumbnail={image.url}
        caption={image.author}
        width={imgRef?.current?.naturalWidth} // Use actual width
        height={imgRef?.current?.naturalHeight} // Use actual height
      >
        {(props) => (
          <Image
            src={image.url}
            alt={image.title || "Gallery Image"}
            className={`${styles.imageItem} ${styles.image}`}
            width={imgRef?.current?.naturalWidth || 300} // Use actual width
            height={imgRef?.current?.naturalHeight || 200} // Use actual height
            sizes="(max-width: 600px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
            loading="lazy"
            onLoad={handleLoad} // Pass onLoad to handleLoad
            ref={props.ref}
            onClick={props.open}
            // ref={(node) => {
            //   if (node && imgRef?.current !== undefined)
            //     imgRef.current = node;
            // }}
          />
        )}
      </Item>
    </div>
  );
};

export default ImageWrapper;
