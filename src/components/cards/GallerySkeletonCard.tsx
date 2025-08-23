import React from "react";
import styles from "./GallerySkeletonCard.module.css";

export interface GallerySkeletonCardProps {
  imageHeight?: number;
  textLines?: number;
  shortText?: boolean;
}

const GallerySkeletonCard: React.FC<GallerySkeletonCardProps> = ({
  imageHeight = 220,
  textLines = 1,
  shortText = false,
}) => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImage} style={{ height: imageHeight }} />
    {Array.from({ length: textLines }).map((_, i) => (
      <div key={i} className={styles.skeletonText} />
    ))}
    {shortText && <div className={styles.skeletonTextShort} />}
  </div>
);

export default GallerySkeletonCard;
