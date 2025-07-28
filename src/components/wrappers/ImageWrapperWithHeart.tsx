import React from "react";
import Image from "next/image";
import { Item } from "./PhotoSwipeWrapperWithHeart"; // Import Item from PhotoSwipeWrapperWithHeart
import HeartButton from "@/components/buttons/HeartButton";
import styles from "./image.module.css";

interface ImageWrapperWithHeartProps {
  image: {
    id: string;
    url: string;
    author: string;
    title?: string;
  };
  imgRef?: React.RefObject<HTMLImageElement | null>; // Add imgRef property
  onLoginRequired?: () => void; // Callback when user needs to login
}

const ImageWrapperWithHeart: React.FC<ImageWrapperWithHeartProps> = ({
  image,
  imgRef,
  onLoginRequired,
}) => {
  return (
    <div className={`${styles.imageCard} ${styles.imageContainer}`}>
      <HeartButton imageId={image.id} onLoginRequired={onLoginRequired} />
      <Item
        original={image.url}
        thumbnail={image.url}
        caption={image.author}
        width={imgRef?.current?.naturalWidth} // Use actual width
        height={imgRef?.current?.naturalHeight} // Use actual height
        // Pass imageId to PhotoSwipe data
        data={{ imageId: image.id }}
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
            ref={props.ref}
            onClick={props.open}
          />
        )}
      </Item>
    </div>
  );
};

export default ImageWrapperWithHeart;
