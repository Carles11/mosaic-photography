import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ImageCard from "../cards/ImageCard";
import { useAppContext } from "@/context/AppContext";
import { getImageDimensions } from "@/helpers/imageHelpers";
import styles from "./gallery.module.css";

interface Image {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
  className?: string; // Add className property
}

const Gallery = () => {
  const [images, setImages] = useState<Image[]>([]);
  const { isMosaic } = useAppContext();
  console.log("isMosaic--->", isMosaic);

  useEffect(() => {
    const fetchImages = async () => {
      const { data: images, error } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching images:", error);
      else {
        const processedImages = await Promise.all(
          images.map(async (image) => {
            const dimensions = await getImageDimensions(image.url);
            return {
              ...image,
              className:
                dimensions.width > dimensions.height
                  ? styles.landscape
                  : styles.portrait,
            };
          })
        );
        setImages(processedImages);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className={styles.galleryGrid}>
      {images.map((image) => (
        <div
          key={image.id}
          className={`${styles.galleryGridItem} ${image.className}`}
          style={{ height: "200px" }}
        >
          <ImageCard key={image.id} image={image} />
        </div>
      ))}
    </div>
  );
};

export default Gallery;
