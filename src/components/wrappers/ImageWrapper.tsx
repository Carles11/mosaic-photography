import React, { useState, useRef } from "react";
import Image from "next/image";
import { Item } from "./PhotoSwipeWrapper"; // Import Item from PhotoSwipeWrapper
import styles from "./image.module.css";

interface ImageWrapperProps {
  image: {
    url: string;
    author: string;
    title?: string;
  };
  // New prop
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({ image }) => {
  const [orientationClass, setOrientationClass] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      const isLandscape = naturalWidth > naturalHeight;
      const orientation = isLandscape ? styles.landscape : styles.portrait;
      setOrientationClass(orientation);
    }
  };

  return (
    <div className={`${styles.imageCard} ${orientationClass}`}>
      <Item
        original={image.url}
        thumbnail={image.url}
        caption={image.author}
        width={imgRef.current?.naturalWidth} // Use actual width
        height={imgRef.current?.naturalHeight} // Use actual height
      >
        {(props) => (
          <div
            ref={props.ref}
            onClick={props.open}
            className={styles.imageItem}
          >
            <Image
              src={image.url}
              alt={image.title || "Gallery Image"}
              className={`${styles.image} ${orientationClass}`}
              width={imgRef.current?.naturalWidth || 300} // Use actual width
              height={imgRef.current?.naturalHeight || 200} // Use actual height// Use actual height
              sizes="(max-width: 600px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
              loading="lazy"
              onLoad={handleLoad}
              ref={(node) => {
                if (node) imgRef.current = node;
              }}
            />
          </div>
        )}
      </Item>
    </div>
  );
};

export default ImageWrapper;
