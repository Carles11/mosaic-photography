import React, { PropsWithChildren, useEffect, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { createPortal } from "react-dom";
import HeartButton from "@/components/buttons/HeartButton";
import "photoswipe/dist/photoswipe.css";

interface PhotoSwipeWrapperProps {
  galleryOptions?: Record<string, string | number | boolean>;
  onLoginRequired?: () => void;
  images?: Array<{ id: string; [key: string]: any }>; // Array of images with at least an id field
}

const PhotoSwipeWrapper: React.FC<
  PropsWithChildren<PhotoSwipeWrapperProps>
> = ({ children, galleryOptions, onLoginRequired, images = [] }) => {
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [photoSwipeContainer, setPhotoSwipeContainer] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create heart button container when PhotoSwipe opens
    const createHeartButtonContainer = (pswpElement: HTMLElement) => {
      // Avoid creating duplicate containers
      if (pswpElement.querySelector(".pswp__heart-container")) {
        return;
      }

      const container = document.createElement("div");
      container.className = "pswp__heart-container";
      container.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        border: none;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 10;
        backdrop-filter: blur(4px);
      `;

      pswpElement.appendChild(container);
      setPhotoSwipeContainer(container);
    };

    // Get current image ID from PhotoSwipe slide index
    const getCurrentImageId = (slideIndex: number): string | null => {
      if (images && images[slideIndex]) {
        return String(images[slideIndex].id);
      }
      return null;
    };

    // Setup PhotoSwipe event listeners
    const setupPhotoSwipeListeners = (pswpElement: HTMLElement) => {
      // Try to get the PhotoSwipe instance
      const pswpInstance = (pswpElement as any).pswp;

      if (pswpInstance) {
        console.log("PhotoSwipe: Found instance, setting up listeners");

        // Set initial image ID
        const initialImageId = getCurrentImageId(pswpInstance.currIndex || 0);
        if (initialImageId) {
          setCurrentImageId(initialImageId);
        }

        // Listen for slide changes
        pswpInstance.on("change", () => {
          const newImageId = getCurrentImageId(pswpInstance.currIndex);
          if (newImageId && newImageId !== currentImageId) {
            setCurrentImageId(newImageId);
          }
        });

        // Clean up when PhotoSwipe closes
        pswpInstance.on("destroy", () => {
          setCurrentImageId(null);
          setPhotoSwipeContainer(null);
        });
      } else {
        // Fallback: try to detect slide changes through DOM observation
        console.log("PhotoSwipe: No instance found, using fallback approach");

        // Set initial image ID (assume first image)
        if (images.length > 0) {
          setCurrentImageId(String(images[0].id));
        }

        // Simple cleanup when element is removed
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
              if (node === pswpElement) {
                setCurrentImageId(null);
                setPhotoSwipeContainer(null);
                observer.disconnect();
              }
            });
          });
        });

        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    // Watch for PhotoSwipe modal creation
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "childList") return;

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            if (element.classList?.contains("pswp")) {
              console.log("PhotoSwipe: Modal opened");

              // Create heart button container
              createHeartButtonContainer(element as HTMLElement);

              // Setup event listeners (with a small delay to ensure PhotoSwipe is fully initialized)
              setTimeout(() => {
                setupPhotoSwipeListeners(element as HTMLElement);
              }, 100);
            }
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [images, currentImageId]); // Include images in dependency array

  return (
    <>
      <Gallery withCaption withDownloadButton options={galleryOptions}>
        {children}
      </Gallery>
      {/* Render HeartButton into PhotoSwipe modal when available */}
      {photoSwipeContainer &&
        currentImageId &&
        createPortal(
          <HeartButton
            imageId={currentImageId}
            onLoginRequired={onLoginRequired}
            className="modalView"
          />,
          photoSwipeContainer,
        )}
    </>
  );
};

export { Item };
export default PhotoSwipeWrapper;
