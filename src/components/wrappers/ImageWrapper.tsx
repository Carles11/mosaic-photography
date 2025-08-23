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
              width={imgRef?.current?.naturalWidth || 1200} // Use actual width
              height={imgRef?.current?.naturalHeight || 800} // Use actual height
              sizes="(max-width: 600px) 100vw, 50vw"
              placeholder="blur"
              blurDataURL="https://dummyimage.com/340x4:3/000/fff&text=mosaic+photography.png"
              loading="lazy"
              data-image-id={imageIdString} // Add image ID as data attribute for PhotoSwipe
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
