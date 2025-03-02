import ImageCard from "../cards/ImageCard";
import AuthorCard from "../cards/AuthorCard";
import { useAppContext } from "@/context/AppContext";
import styles from "./gallery.module.css";

const Gallery = () => {
  const { isMosaic } = useAppContext();

  return (
    <div className={styles.galleryGrid}>
      {isMosaic ? <ImageCard /> : <AuthorCard />}
    </div>
  );
};

export default Gallery;
