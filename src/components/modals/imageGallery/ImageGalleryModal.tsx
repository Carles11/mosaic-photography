import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import styles from "./imageGalleryModal.module.css";
import Image from "next/image";

interface ImageGalleryModalProps {
  images: { original: string; thumbnail: string }[];
  startIndex: number;
  onClose: () => void;
  play: boolean;
  bullets: boolean;
  fullscreen: boolean;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  startIndex,
  onClose,
}) => {
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.imageGalleryModal} onClick={handleBackgroundClick}>
      <button onClick={onClose} className={styles.closeButton}>
        <Image src="/icons/close-icon.png" alt="Close" width={32} height={32} />
      </button>
      <ImageGallery
        items={images}
        startIndex={startIndex}
        showThumbnails={false}
        lazyLoad={true}
        showBullets={false}
        showFullscreenButton={true}
        showPlayButton={true}
      />
    </div>
  );
};

export default ImageGalleryModal;
