import React, { PropsWithChildren, useEffect, useRef } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { useFavorites } from "@/context/FavoritesContext";
import "photoswipe/dist/photoswipe.css";

interface PhotoSwipeWrapperWithHeartProps {
  galleryOptions?: Record<string, string | number | boolean>;
  onLoginRequired?: () => void;
}

const PhotoSwipeWrapperWithHeart: React.FC<
  PropsWithChildren<PhotoSwipeWrapperWithHeartProps>
> = ({ children, galleryOptions, onLoginRequired }) => {
  const { isFavorite, toggleFavorite, isUserLoggedIn } = useFavorites();
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for PhotoSwipe events to add custom heart button
    const handlePhotoSwipeInit = (e: Event) => {
      // @ts-expect-error: PhotoSwipe event handling
      const pswp = e.detail.pswp;

      if (!pswp) return;

      // Create heart button element
      const heartButton = document.createElement("button");
      heartButton.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      `;

      // Apply styles to the heart button
      heartButton.style.cssText = `
        position: absolute;
          top: 59px;
    right: 9px;
        width: 48px;
        height: 48px;
        background: rgba(0, 0, 0, 0.8);
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 1000;
        backdrop-filter: blur(4px);
        color: rgba(255, 255, 255, 0.8);
        outline: none;
      `;

      // Update heart button appearance based on favorite status
      const updateHeartButton = () => {
        const currentSlide = pswp.currSlide;
        if (currentSlide && currentSlide.data && currentSlide.data.imageId) {
          const isLiked = isFavorite(currentSlide.data.imageId);
          const svg = heartButton.querySelector("svg");
          if (svg) {
            svg.style.fill = isLiked ? "currentColor" : "none";
            heartButton.style.color = isLiked
              ? "#ff4757"
              : "rgba(255, 255, 255, 0.8)";
            heartButton.title = isLiked
              ? "Remove from favorites"
              : "Add to favorites";
            heartButton.setAttribute(
              "aria-label",
              isLiked ? "Remove from favorites" : "Add to favorites",
            );
          }
        }
      };

      // Handle click
      heartButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentSlide = pswp.currSlide;
        if (currentSlide && currentSlide.data && currentSlide.data.imageId) {
          if (!isUserLoggedIn()) {
            onLoginRequired?.();
            return;
          }

          await toggleFavorite(currentSlide.data.imageId);
          updateHeartButton();
        }
      });

      // Hover effects
      heartButton.addEventListener("mouseenter", () => {
        heartButton.style.background = "rgba(0, 0, 0, 0.9)";
        heartButton.style.transform = "scale(1.1)";
      });

      heartButton.addEventListener("mouseleave", () => {
        heartButton.style.background = "rgba(0, 0, 0, 0.8)";
        heartButton.style.transform = "scale(1)";
      });

      // Initial update
      updateHeartButton();

      // Update on slide change
      pswp.on("change", updateHeartButton);

      // Add the heart button to PhotoSwipe UI
      const uiElement = pswp.element.querySelector(".pswp__top-bar");
      if (uiElement) {
        uiElement.appendChild(heartButton);
      }
    };

    // Listen for PhotoSwipe gallery initialization
    document.addEventListener("photoswipe:init", handlePhotoSwipeInit);

    return () => {
      document.removeEventListener("photoswipe:init", handlePhotoSwipeInit);
    };
  }, [isFavorite, toggleFavorite, isUserLoggedIn, onLoginRequired]);

  return (
    <div ref={galleryRef}>
      <Gallery withCaption withDownloadButton options={galleryOptions}>
        {children}
      </Gallery>
    </div>
  );
};

export { Item };
export default PhotoSwipeWrapperWithHeart;
