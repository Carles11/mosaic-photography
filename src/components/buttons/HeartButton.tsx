"use client";
import React from "react";
import styles from "./HeartButton.module.css";
import { useFavorites } from "@/context/FavoritesContext";
import { useRouter } from "next/navigation";

interface HeartButtonProps {
  imageId: string | number;
  className?: string;
  onLoginRequired?: () => void; // Callback when user needs to login
}

const HeartButton: React.FC<HeartButtonProps> = ({
  imageId,
  className = "",
  onLoginRequired,
}) => {
  const { isFavorite, toggleFavorite, isUserLoggedIn } = useFavorites();
  const router = useRouter();

  const handleClick = async () => {
    try {
      if (!isUserLoggedIn()) {
        // User is not logged in, trigger login modal
        if (!onLoginRequired) {
          router.push("/auth/login");
        } else {
          onLoginRequired?.();
        }

        return;
      }

      await toggleFavorite(imageId);
    } catch (error) {
      console.error("HeartButton: Error toggling favorite:", error);
      // Optionally show a user-friendly error message
    }
  };

  const isLiked = isFavorite(imageId);

  return (
    <button
      id="heart-icon"
      className={`${styles.heartButton} ${className} ${
        isLiked ? styles.liked : styles.unliked
      }`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleClick();
      }}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
      title={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
};

export default HeartButton;
