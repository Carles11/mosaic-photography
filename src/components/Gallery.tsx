// filepath: /C:/Users/Usuario/Documents/AAA_REPOs/mosaic/src/components/Gallery.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ImageCard from "./ImageCard";
import { useAppContext } from "@/context/AppContext";

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
  const { isMosaic } = useAppContext();
  console.log("isMosaic--->", isMosaic);
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
    <div className="gallery-grid">
      {images.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </div>
  );
};

export default Gallery;
