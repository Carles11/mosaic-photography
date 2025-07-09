"use client";

import { useState, useEffect } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import styles from "./FavoritesList.module.css";

export default function FavoritesList() {
  const { favorites, loading, isUserLoggedIn } = useFavorites();
  const [favoriteImages, setFavoriteImages] = useState<string[]>([]);

  useEffect(() => {
    if (favorites) {
      setFavoriteImages(Array.from(favorites));
    }
  }, [favorites]);

  if (!isUserLoggedIn()) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading favorites...</p>
      </div>
    );
  }

  if (favoriteImages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>♡</div>
        <h3>No favorites yet</h3>
        <p>Start exploring the gallery and heart the images you love!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Your Favorites ({favoriteImages.length})
        </h3>
        <p className={styles.subtitle}>
          Images you&apos;ve saved to your collection
        </p>
      </div>

      <div className={styles.grid}>
        {favoriteImages.map((imageId) => (
          <div key={imageId} className={styles.favoriteItem}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.imageId}>{imageId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
