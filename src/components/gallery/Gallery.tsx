import ImageCard from "../cards/ImageCard";
import AuthorCard from "../cards/AuthorCard";
import GoToTopButton from "@/components/buttons/GoToTopButton";

import styles from "./gallery.module.css";

const Gallery = ({ isMosaic }: { isMosaic: boolean }) => {
  return (
    <div className={styles.galleryGridContainer}>
      {isMosaic ? (
        <div className={styles.galleryGrid}>
          <ImageCard />
        </div>
      ) : (
        <AuthorCard />
      )}
      <GoToTopButton />
    </div>
  );
};

export default Gallery;
