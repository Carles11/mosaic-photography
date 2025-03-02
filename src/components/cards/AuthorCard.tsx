import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import styles from "./AuthorCard.module.css";

interface Photographer {
  name: string;
  surname: string;
  biography: string;
  birthdate: string;
  deceasedate: string | null;
}

interface Image {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
  className?: string;
}

const AuthorCard: React.FC = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotographers = async () => {
      const { data, error } = await supabase
        .from("photographers")
        .select("name,surname,biography,birthdate,deceasedate");

      if (error) {
        setError(error.message);
      } else {
        setPhotographers(data);
      }
    };

    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("images")
        .select("id,url,author,title,description,created_at");

      if (error) {
        setError(error.message);
      } else {
        setImages(data);
      }
    };

    fetchPhotographers();
    fetchImages();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const imagesByAuthor = images.reduce((acc, image) => {
    if (!acc[image.author]) {
      acc[image.author] = [];
    }
    acc[image.author].push(image);
    return acc;
  }, {} as Record<string, Image[]>);

  return (
    <div className={styles.authorCardContainer}>
      {photographers.map((photographer, index) => (
        <div key={index} className={styles.authorCard}>
          <h2>
            {`${photographer.name} ${photographer.surname}`.toUpperCase()}
          </h2>
          <p>{photographer.biography || "No biography available."}</p>
          <p>
            <strong>Birthdate:</strong>{" "}
            {new Date(photographer.birthdate).toLocaleDateString()}
          </p>
          {photographer.deceasedate && (
            <p>
              <strong>Deceasedate:</strong>{" "}
              {new Date(photographer.deceasedate).toLocaleDateString()}
            </p>
          )}
          <div className={styles.imageList}>
            {imagesByAuthor[photographer.name]?.map((image, index) => (
              <Image
                key={index}
                src={image.url}
                alt={image.title}
                width={50}
                height={50}
                className={styles.image}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorCard;
