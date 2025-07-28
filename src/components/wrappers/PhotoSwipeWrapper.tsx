import React, { PropsWithChildren, useEffect, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { createPortal } from "react-dom";
import HeartButton from "@/components/buttons/HeartButton";
import "photoswipe/dist/photoswipe.css";

interface PhotoSwipeWrapperProps {
  galleryOptions?: Record<string, string | number | boolean>;
  onLoginRequired?: () => void;
}

const PhotoSwipeWrapper: React.FC<
  PropsWithChildren<PhotoSwipeWrapperProps>
> = ({ children, galleryOptions, onLoginRequired }) => {
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [photoSwipeContainer, setPhotoSwipeContainer] =
    useState<HTMLElement | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean>(false);

  useEffect(() => {
    // Listen for PhotoSwipe events
    const handlePhotoSwipeInit = (e: Event) => {
      // @ts-expect-error: PhotoSwipe event handling
      const pswp = e.detail?.pswp;

      if (!pswp) {
        return;
      }

      setupHeartButton(pswp);
    };

    // Setup heart button for PhotoSwipe instance
    const setupHeartButton = (pswp: any) => {
      // Prevent multiple setups for the same instance
      if (setupComplete) {
        return;
      }

      console.log("PhotoSwipe: Setting up heart button container");
      setSetupComplete(true);

      // Always create a custom container to avoid conflicts with PhotoSwipe UI
      const container = document.createElement("div");
      container.className = "pswp__heart-container";
      container.style.cssText = `
        position: absolute;
     top: 59px;
    right: 9px;
        z-index: 1010;
        pointer-events: auto;
        width: 48px;
        height: 48px;
      `;

      // Add container directly to the PhotoSwipe element
      if (pswp.element) {
        pswp.element.appendChild(container);
      }

      setPhotoSwipeContainer(container);

      // Extract and set current image ID
      const extractImageId = () => {
        const currentSlide = pswp.currSlide;
        console.log("PhotoSwipe: Current slide:", currentSlide);
        console.log("PhotoSwipe: Current slide data:", currentSlide?.data);

        if (currentSlide && currentSlide.data) {
          // Log all available slide data to understand the structure
          console.log(
            "PhotoSwipe: All slide data keys:",
            Object.keys(currentSlide.data),
          );
          console.log("PhotoSwipe: All slide data values:", currentSlide.data);

          // Try to get ID from slide data first (this is where the Item id prop would be)
          let id = currentSlide.data.id;
          console.log("PhotoSwipe: Slide data ID:", id);

          // Also try alt as fallback since we're passing it
          if (!id && currentSlide.data.alt) {
            id = currentSlide.data.alt;
            console.log("PhotoSwipe: Using alt as ID:", id);
          }

          if (!id) {
            // Try to get from PhotoSwipe's slide index and match with gallery data
            const slideIndex = pswp.currIndex;
            console.log("PhotoSwipe: Current slide index:", slideIndex);

            // Try to access the gallery data through the pswp instance
            if (
              pswp.options &&
              pswp.options.dataSource &&
              pswp.options.dataSource[slideIndex]
            ) {
              const slideData = pswp.options.dataSource[slideIndex];
              console.log("PhotoSwipe: Data source slide data:", slideData);
              id = slideData.id || slideData.alt;
            }
          }

          if (!id) {
            // Fallback: try getting it from image element
            const imgElement =
              currentSlide.content?.element?.querySelector("img");
            if (imgElement) {
              id = imgElement.getAttribute("data-image-id");
              console.log("PhotoSwipe: Data-image-id attribute:", id);

              // If no data-image-id, try the alt attribute (PhotoSwipe preserves this!)
              if (!id && imgElement.alt) {
                id = imgElement.alt;
                console.log("PhotoSwipe: Using alt attribute as ID:", id);
              }

              // If still no ID, try to set it from the original image in the gallery
              if (!id) {
                // Find the original image in the gallery by index
                const slideIndex = pswp.currIndex;
                const galleryImages =
                  document.querySelectorAll("[data-image-id]");
                if (galleryImages[slideIndex]) {
                  const originalId =
                    galleryImages[slideIndex].getAttribute("data-image-id");
                  console.log(
                    "PhotoSwipe: Found original image ID:",
                    originalId,
                  );
                  if (originalId) {
                    // Set it on the PhotoSwipe image for future reference
                    imgElement.setAttribute("data-image-id", originalId);
                    id = originalId;
                  }
                }
              }
            }
          }

          if (id && id !== currentImageId) {
            console.log("PhotoSwipe: Extracted image ID:", id);
            console.log("PhotoSwipe: ID type:", typeof id);
            console.log("PhotoSwipe: ID source: slide data or data-image-id");
            setCurrentImageId(id);
            return id;
          }
        } else {
          console.log("PhotoSwipe: No slide or slide data available");
        }
        return currentImageId;
      };

      // Initial extraction
      setTimeout(extractImageId, 100);

      // Update on slide change
      pswp.on("change", () => {
        setTimeout(extractImageId, 50);
      });

      // Cleanup when PhotoSwipe closes
      pswp.on("destroy", () => {
        console.log(
          "PhotoSwipe: Modal closing, current image ID was:",
          currentImageId,
        );

        // Force a slight delay to ensure context state is synchronized
        setTimeout(() => {
          setCurrentImageId(null);
          setPhotoSwipeContainer(null);
          setSetupComplete(false);

          // Force a re-render of gallery HeartButtons by dispatching a custom event
          const event = new CustomEvent("photoswipe-closed", {
            detail: { imageId: currentImageId },
          });
          document.dispatchEvent(event);
        }, 100);
      });
    };

    // Fallback: Create heart button without PhotoSwipe instance
    const createSimpleHeartButton = (pswpElement: HTMLElement) => {
      // Prevent multiple setups for the same element
      if (
        setupComplete ||
        pswpElement.querySelector(".pswp__heart-container")
      ) {
        return;
      }

      setSetupComplete(true);

      // Create a simple container
      const container = document.createElement("div");
      container.className = "pswp__heart-container";
      container.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 1010;
        pointer-events: auto;
        width: 48px;
        height: 48px;
      `;

      pswpElement.appendChild(container);
      setPhotoSwipeContainer(container);

      // Try to extract image ID from the current visible image
      const extractImageIdSimple = () => {
        // First, try to find the PhotoSwipe instance and get data from it
        const pswpInstance = (pswpElement as any).pswp;
        if (
          pswpInstance &&
          pswpInstance.currSlide &&
          pswpInstance.currSlide.data
        ) {
          const slideData = pswpInstance.currSlide.data;
          console.log("PhotoSwipe: Simple - Found slide data:", slideData);
          console.log(
            "PhotoSwipe: Simple - All slide data keys:",
            Object.keys(slideData),
          );
          console.log("PhotoSwipe: Simple - All slide data values:", slideData);

          let id = slideData.id;
          if (!id && slideData.alt) {
            id = slideData.alt;
            console.log("PhotoSwipe: Simple - Using alt as ID:", id);
          }

          if (id && id !== currentImageId) {
            console.log("PhotoSwipe: Using slide data ID:", id);
            setCurrentImageId(id);
            return slideData.id;
          }
        }

        const imgElement = pswpElement.querySelector("img");

        if (imgElement) {
          // Try data-image-id first (this is the proper numeric ID)
          let id = imgElement.getAttribute("data-image-id");
          console.log("PhotoSwipe: data-image-id attribute:", id);

          // If no data-image-id, try the alt attribute (PhotoSwipe preserves this!)
          if (!id && imgElement.alt) {
            id = imgElement.alt;
            console.log("PhotoSwipe: Using alt attribute as ID:", id);
          }

          // If no data-image-id, try to find it from the original gallery images
          if (!id) {
            console.log("PhotoSwipe: Trying to find original gallery image ID");

            // Try to get slide index from PhotoSwipe instance
            let slideIndex = -1;
            if (pswpInstance && pswpInstance.currIndex !== undefined) {
              slideIndex = pswpInstance.currIndex;
            }

            // Find the original image in the gallery by index
            const galleryImages = document.querySelectorAll("[data-image-id]");
            console.log(
              "PhotoSwipe: Found gallery images with data-image-id:",
              galleryImages.length,
            );
            console.log("PhotoSwipe: Current slide index:", slideIndex);

            if (slideIndex >= 0 && galleryImages[slideIndex]) {
              const originalId =
                galleryImages[slideIndex].getAttribute("data-image-id");
              console.log(
                "PhotoSwipe: Found original image ID at index",
                slideIndex,
                ":",
                originalId,
              );
              if (originalId) {
                // Set it on the PhotoSwipe image for future reference
                imgElement.setAttribute("data-image-id", originalId);
                id = originalId;
              }
            } else {
              // Try to match by src as last resort
              const imgSrc = imgElement.src;
              console.log("PhotoSwipe: Trying to match by src:", imgSrc);

              for (let i = 0; i < galleryImages.length; i++) {
                const galleryImg = galleryImages[i] as HTMLImageElement;
                if (galleryImg.src === imgSrc) {
                  const originalId = galleryImg.getAttribute("data-image-id");
                  console.log(
                    "PhotoSwipe: Found matching image by src, ID:",
                    originalId,
                  );
                  if (originalId) {
                    imgElement.setAttribute("data-image-id", originalId);
                    id = originalId;
                    break;
                  }
                }
              }
            }
          }

          // Remove the temporary filename fallback since alt should work
          if (!id) {
            console.error(
              "PhotoSwipe: No proper image ID found! data-image-id is null and alt is empty",
            );
            console.log("PhotoSwipe: Image src:", imgElement.src);
            console.log(
              "PhotoSwipe: Image attributes:",
              imgElement
                .getAttributeNames()
                .map((name) => `${name}="${imgElement.getAttribute(name)}"`),
            );
          }

          // Only update if ID has changed to prevent loops
          if (id && id !== currentImageId) {
            console.log("PhotoSwipe: Simple extraction - ID:", id);
            console.log("PhotoSwipe: Simple extraction - ID type:", typeof id);
            console.log(
              "PhotoSwipe: Simple extraction - Is numeric:",
              /^\d+$/.test(id),
            );
            setCurrentImageId(id);
            return id;
          }
        }
        return currentImageId; // Return current ID if no change
      };

      // Initial extraction
      setTimeout(extractImageIdSimple, 100);

      // Check for image changes periodically with longer intervals to reduce spam
      const intervalId = setInterval(extractImageIdSimple, 5000); // Every 5 seconds instead of 2

      // Clean up when modal is removed
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (node === pswpElement) {
              clearInterval(intervalId);
              setCurrentImageId(null);
              setPhotoSwipeContainer(null);
              setSetupComplete(false);
              observer.disconnect();
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    };

    // Listen for multiple possible PhotoSwipe events
    const events = ["photoswipe:init", "pswp:init", "init"];
    events.forEach((eventName) => {
      document.addEventListener(eventName, handlePhotoSwipeInit);
    });

    // Use MutationObserver to detect when PhotoSwipe opens
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Check if PhotoSwipe modal is added
            if (
              element.classList?.contains("pswp") ||
              element.querySelector?.(".pswp")
            ) {
              // Try to find PhotoSwipe instance
              const pswpElement = element.classList?.contains("pswp")
                ? element
                : element.querySelector(".pswp");

              if (pswpElement && (pswpElement as any).pswp) {
                setupHeartButton((pswpElement as any).pswp);
              } else {
                // Try to find instance in window or global scope
                const tryAlternativeInstance = () => {
                  // Check for react-photoswipe-gallery instance
                  const galleryInstance = (window as any)
                    .reactPhotoSwipeGallery;
                  if (galleryInstance) {
                    setupHeartButton(galleryInstance);
                    return true;
                  }

                  // Try to create a simple heart button without PhotoSwipe instance
                  if (pswpElement) {
                    createSimpleHeartButton(pswpElement as HTMLElement);
                    return true;
                  }

                  return false;
                };

                // Try immediately
                if (!tryAlternativeInstance()) {
                  // Wait a bit more for PhotoSwipe to initialize
                  setTimeout(() => {
                    if (pswpElement && (pswpElement as any).pswp) {
                      setupHeartButton((pswpElement as any).pswp);
                    } else {
                      tryAlternativeInstance();
                    }
                  }, 500);
                }
              }
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

    // Periodic check as fallback
    const intervalId = setInterval(() => {
      const pswpElement = document.querySelector(".pswp:not(.pswp--hidden)");
      if (pswpElement && (pswpElement as any).pswp && !photoSwipeContainer) {
        setupHeartButton((pswpElement as any).pswp);
      }
    }, 1000);

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, handlePhotoSwipeInit);
      });
      observer.disconnect();
      clearInterval(intervalId);
      setSetupComplete(false);
    };
  }, []); // Remove dependencies to prevent re-running the effect

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
