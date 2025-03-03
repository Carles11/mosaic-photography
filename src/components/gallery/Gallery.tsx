import ImageCard from "../cards/ImageCard";
import AuthorCard from "../cards/AuthorCard";
import { useAppContext } from "@/context/AppContext";
import styles from "./gallery.module.css";

const Gallery = () => {
  const { isMosaic } = useAppContext();

  console.log("isMosaic:", isMosaic); // Debugging information

  return (
    <div className={styles.galleryGridContainer}>
      {isMosaic ? (
        <div className={styles.galleryGrid}>
          <ImageCard />
        </div>
      ) : (
        <AuthorCard />
      )}
    </div>
  );
};

export default Gallery;
