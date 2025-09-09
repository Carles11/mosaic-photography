// ImageWrapper: All images are loaded exclusively via Next.js <Image /> with lazy loading.
// No manual preloading, pre-caching, or window.Image() logic is used anywhere in the codebase.
// This ensures optimal SEO, accessibility, and performance. See README for details.
import React from "react";
import Image from "next/image";
import { Item } from "./PhotoSwipeWrapper";
import styles from "./image.module.css";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";

interface ImageWrapperProps {
  image: {
    id: string;
    url: string;
    author: string;
    orientation?: string;
    title?: string;
  };
  imgRef?: React.RefObject<HTMLImageElement | null>;
  onLoginRequired?: () => void;
}

const ImageWrapper: React.FC<ImageWrapperProps> = ({
  image,
  imgRef,
  onLoginRequired,
}) => {
  // Set default width/height based on orientation
  let imgWidth = 200;
  let imgHeight = 225;
  let sizes = "(max-width: 600px) 100vw, 200px";
  if (image.orientation === "horizontal") {
    imgWidth = 400;
    imgHeight = 225;
    sizes = "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 400px";
  } else if (image.orientation === "vertical") {
    imgWidth = 200;
    imgHeight = 267;
    sizes = "(max-width: 600px) 100vw, 200px";
  } else if (image.orientation === "square") {
    imgWidth = 250;
    imgHeight = 250;
    sizes = "(max-width: 600px) 100vw, 250px";
  }

  // Ensure ID is always a string (database might return number)
  const imageIdString = String(image.id);
  // Modal state and handlers are now managed by modal context

  return (
    <>
      <div className={`${styles.imageCard} ${styles.imageContainer}`}>
        <HeartButton
          imageId={imageIdString}
          onLoginRequired={onLoginRequired}
        />
        <CommentsLauncher
          imageId={imageIdString}
          onLoginRequired={onLoginRequired}
          className={styles.commentsButton}
        />
        <Item
          original={image.url}
          thumbnail={image.url}
          caption={`${image.title}`}
          width={imgRef?.current?.naturalWidth} // Use actual width
          height={imgRef?.current?.naturalHeight} // Use actual height
          id={imageIdString} // Pass image ID to PhotoSwipe for hash navigation and identification
          alt={imageIdString} // Also pass as alt for fallback access
        >
          {(props) => (
            <Image
              src={image.url}
              alt={image.title || "Gallery Image"}
              className={`${styles.imageItem} ${styles.image}`}
              width={imgWidth}
              height={imgHeight}
              sizes={sizes}
              quality={60} // <--- Lower quality for grid images!
              placeholder="blur"
              blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
              loading="lazy"
              data-image-id={imageIdString}
              ref={props.ref}
              onClick={props.open}
            />
          )}
        </Item>
      </div>

      {/* Comments Modal is now handled by modal context system */}
    </>
  );
};

export default ImageWrapper;
