// ImageWrapper: All images are loaded exclusively via Next.js <Image /> with lazy loading.
// No manual preloading, pre-caching, or window.Image() logic is used anywhere in the codebase.
// This ensures optimal SEO, accessibility, and performance. See README for details.
import React, { useState } from "react";
import Image from "next/image";
import { Item } from "./PhotoSwipeWrapper"; // Import Item from PhotoSwipeWrapper
import styles from "./image.module.css";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsButton from "@/components/buttons/CommentsButton";
import CommentsModal from "@/components/modals/comments/CommentsModal";

interface ImageWrapperProps {
  image: {
    id: string;
    url: string;
    author: string;
    orientation: string;
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
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  const handleOpenCommentsModal = () => {
    setIsCommentsModalOpen(true);
  };

  const handleCloseCommentsModal = () => {
    setIsCommentsModalOpen(false);
  };

  return (
    <>
      <div className={`${styles.imageCard} ${styles.imageContainer}`}>
        <HeartButton
          imageId={imageIdString}
          onLoginRequired={onLoginRequired}
        />
        <CommentsButton
          imageId={imageIdString}
          onOpenModal={handleOpenCommentsModal}
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
              quality={40}
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

      {/* Comments Modal */}
      <CommentsModal
        imageId={imageIdString}
        isOpen={isCommentsModalOpen}
        onClose={handleCloseCommentsModal}
        onLoginRequired={onLoginRequired}
      />
    </>
  );
};

export default ImageWrapper;
