import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ImageCard from "../cards/ImageCard";

import styles from "./gallery.module.css";

interface Image {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
}

const Gallery = () => {
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const { data: images, error } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching images:", error);
      else setImages(images);
    };

    fetchImages();
  }, []);

  return (
    <div className={styles.galleryGrid}>
      {images.map((image) => (
        <div key={image.id} className={styles.galleryGridItem}>
          <ImageCard key={image.id} image={image} />
        </div>
      ))}
    </div>
  );
};

export default Gallery;
