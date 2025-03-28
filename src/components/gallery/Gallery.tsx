import ImageCard from "../cards/ImageCard";
import AuthorCard from "../cards/AuthorCard";
import GoToTopButton from "@/components/buttons/GoToTopButton";

import styles from "./gallery.module.css";

type MosaicProp = {
  isMosaic: boolean;
};
const Gallery = (mosaicProp: MosaicProp) => {
  return (
    <div className={styles.galleryGridContainer}>
      {mosaicProp.isMosaic ? (
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
