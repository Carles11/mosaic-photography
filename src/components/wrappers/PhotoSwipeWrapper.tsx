import React, { PropsWithChildren, useEffect, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { createPortal } from "react-dom";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsButton from "@/components/buttons/CommentsButton";
import CommentsModal from "@/components/modals/comments/CommentsModal";
import "photoswipe/dist/photoswipe.css";

interface PhotoSwipeWrapperProps {
  galleryOptions?: Record<string, string | number | boolean>;
  onLoginRequired?: () => void;
  images?: Array<{ id: string | number; [key: string]: unknown }>; // Array of images with at least an id field
}

// Global state to prevent multiple PhotoSwipe handlers
let isPhotoSwipeHandlerActive = false;

const PhotoSwipeWrapper: React.FC<
  PropsWithChildren<PhotoSwipeWrapperProps>
> = ({ children, galleryOptions, onLoginRequired, images = [] }) => {
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [photoSwipeContainer, setPhotoSwipeContainer] =
    useState<HTMLElement | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

  const handleOpenCommentsModal = () => {
    setIsCommentsModalOpen(true);
  };

  const handleCloseCommentsModal = () => {
    setIsCommentsModalOpen(false);
  };

  // Extract image ID directly from PhotoSwipe's slide data
  const getImageIdFromPhotoSwipe = (pswpInstance: {
    currSlide?: { data?: { id?: string | number; alt?: string } };
  }): string | null => {
    if (!pswpInstance || !pswpInstance.currSlide) {
      return null;
    }

    const slideData = pswpInstance.currSlide.data;

    // The ID should be in slideData.id (passed from our Item component)
    if (slideData && slideData.id) {
      const imageId = String(slideData.id);
      return imageId;
    }

    // Fallback: try to get from alt attribute
    if (slideData && slideData.alt) {
      const imageId = String(slideData.alt);
      return imageId;
    }

    return null;
  };

  useEffect(() => {
    // Only one instance should handle PhotoSwipe detection globally
    if (isPhotoSwipeHandlerActive) {
      return;
    }

    isPhotoSwipeHandlerActive = true;

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
        width: auto;
        height: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        z-index: 10;
        backdrop-filter: blur(4px);
        gap: 10px;
      `;

      pswpElement.appendChild(container);
      setPhotoSwipeContainer(container);
    };

    // Setup PhotoSwipe event listeners

    const setupPhotoSwipeListeners = (pswpElement: HTMLElement): boolean => {
      // Try multiple ways to access the PhotoSwipe instance
      let pswpInstance: any = (pswpElement as unknown as { pswp?: unknown })
        .pswp;

      if (!pswpInstance) {
        // Try alternative property names
        pswpInstance = (pswpElement as unknown as { photoswipe?: unknown })
          .photoswipe;
      }

      if (!pswpInstance) {
        // Try to find it in the global window object
        pswpInstance = (window as unknown as { pswp?: unknown }).pswp;
      }

      if (!pswpInstance) {
        // Try to access through data attributes or other methods
        const pswpData = pswpElement.getAttribute("data-pswp");
        if (pswpData) {
          try {
            pswpInstance = JSON.parse(pswpData);
          } catch {
            // Ignore parsing errors
          }
        }
      }

      if (pswpInstance) {
        // Set initial image ID
        const initialImageId = getImageIdFromPhotoSwipe(pswpInstance);
        if (initialImageId) {
          setCurrentImageId(initialImageId);
        }

        // Listen for slide changes
        pswpInstance.on("change", () => {
          const newImageId = getImageIdFromPhotoSwipe(pswpInstance);

          if (newImageId) {
            setCurrentImageId(newImageId);
          }
        });

        // Clean up when PhotoSwipe closes
        pswpInstance.on("destroy", () => {
          setCurrentImageId(null);
          setPhotoSwipeContainer(null);
        });

        return true; // Success
      }

      return false; // Failed to find instance
    };

    // Watch for PhotoSwipe modal creation
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "childList") return;

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            if (element.classList?.contains("pswp")) {
              // Create heart button container
              createHeartButtonContainer(element as HTMLElement);

              // Setup event listeners with multiple attempts
              let attemptCount = 0;
              const maxAttempts = 10;
              const attemptInterval = 100; // ms

              const trySetupListeners = () => {
                attemptCount++;

                const success = setupPhotoSwipeListeners(
                  element as HTMLElement,
                );

                if (!success && attemptCount < maxAttempts) {
                  setTimeout(trySetupListeners, attemptInterval);
                } else if (!success) {
                  // Fallback: Try to extract image ID from DOM or first image
                  let fallbackImageId: string | null = null;

                  // Try to find image ID from the current slide's img element
                  const currentImg = element.querySelector(
                    ".pswp__img",
                  ) as HTMLImageElement;

                  if (currentImg && currentImg.dataset.imageId) {
                    fallbackImageId = currentImg.dataset.imageId;
                  } else if (currentImg && currentImg.alt) {
                    fallbackImageId = currentImg.alt;
                  } else if (
                    currentImg &&
                    currentImg.src &&
                    images &&
                    images.length > 0
                  ) {
                    // Try to match the image URL with our images array
                    const matchingImage = images.find((img) =>
                      typeof img.id === "string" || typeof img.id === "number"
                        ? currentImg.src.includes(String(img.id)) ||
                          String((img as { url?: string }).url || "").includes(
                            currentImg.src.split("/").pop() || "",
                          ) ||
                          currentImg.src.includes(
                            String((img as { url?: string }).url || "")
                              .split("/")
                              .pop() || "",
                          )
                        : false,
                    );

                    if (matchingImage) {
                      fallbackImageId = String(matchingImage.id);
                    }
                  }

                  if (!fallbackImageId && images && images.length > 0) {
                    // Last resort: use first image ID
                    fallbackImageId = String(images[0].id);
                  }

                  if (fallbackImageId) {
                    setCurrentImageId(fallbackImageId);

                    // Set up responsive checking for slide changes
                    let lastImageId = fallbackImageId;
                    let lastImageSrc = "";

                    const getCurrentImageInfo = () => {
                      const currentImg = element.querySelector(
                        ".pswp__img",
                      ) as HTMLImageElement;

                      // Also try to find all images in the current slide
                      const allImages = element.querySelectorAll(".pswp__img");

                      const visibleImg = Array.from(allImages).find((img) => {
                        const rect = img.getBoundingClientRect();
                        // Look for images that are not only visible but also substantially sized and centered
                        const isVisible = rect.width > 0 && rect.height > 0;
                        const isSubstantial =
                          rect.width > 100 && rect.height > 100; // Ignore tiny images
                        const isCentered =
                          rect.x > -100 && rect.x < window.innerWidth - 100; // Not too far off-screen

                        return isVisible && isSubstantial && isCentered;
                      }) as HTMLImageElement;

                      // If no good centered image, fall back to largest visible image
                      let targetImg = visibleImg;
                      if (!targetImg) {
                        const visibleImages = Array.from(allImages).filter(
                          (img) => {
                            const rect = img.getBoundingClientRect();
                            return rect.width > 0 && rect.height > 0;
                          },
                        );

                        if (visibleImages.length > 0) {
                          // Find the largest visible image
                          targetImg = visibleImages.reduce(
                            (largest, current) => {
                              const largestRect =
                                largest.getBoundingClientRect();
                              const currentRect =
                                current.getBoundingClientRect();
                              const largestArea =
                                largestRect.width * largestRect.height;
                              const currentArea =
                                currentRect.width * currentRect.height;
                              return currentArea > largestArea
                                ? current
                                : largest;
                            },
                          ) as HTMLImageElement;
                        } else {
                          targetImg = currentImg;
                        }
                      }

                      let newImageId: string | null = null;

                      if (targetImg && targetImg.dataset.imageId) {
                        newImageId = targetImg.dataset.imageId;
                      } else if (targetImg && targetImg.alt) {
                        newImageId = targetImg.alt;
                      } else if (
                        targetImg &&
                        targetImg.src &&
                        images &&
                        images.length > 0
                      ) {
                        const matchingImage = images.find((img) =>
                          typeof img.id === "string" ||
                          typeof img.id === "number"
                            ? targetImg.src.includes(String(img.id)) ||
                              String(
                                (img as { url?: string }).url || "",
                              ).includes(
                                targetImg.src.split("/").pop() || "",
                              ) ||
                              targetImg.src.includes(
                                String((img as { url?: string }).url || "")
                                  .split("/")
                                  .pop() || "",
                              )
                            : false,
                        );

                        if (matchingImage) {
                          newImageId = String(matchingImage.id);
                        }
                      }

                      return {
                        newImageId,
                        currentImgSrc: targetImg?.src || "",
                        // totalImages and visibleImages are not used, so omit them
                      };
                    };

                    const checkForSlideChanges = () => {
                      const { newImageId, currentImgSrc } =
                        getCurrentImageInfo();

                      // Only check if we have valid data (avoid null states during transitions)
                      if (!newImageId && !currentImgSrc) {
                        return; // Skip this check - probably mid-transition
                      }

                      // Check if either the image ID or src changed
                      if (
                        (newImageId && newImageId !== lastImageId) ||
                        (currentImgSrc && currentImgSrc !== lastImageSrc)
                      ) {
                        if (newImageId) {
                          setCurrentImageId(newImageId);
                          lastImageId = newImageId;
                        }
                        lastImageSrc = currentImgSrc;
                      }
                    };

                    // Use more reasonable interval
                    const slideCheckInterval = setInterval(
                      checkForSlideChanges,
                      200, // Slower but more stable - 200ms
                    );

                    // Also watch for DOM changes in the PhotoSwipe element (less aggressive)
                    const slideObserver = new MutationObserver((mutations) => {
                      let shouldCheck = false;

                      mutations.forEach((mutation) => {
                        // Only check for significant changes
                        if (mutation.type === "childList") {
                          const hasImageChanges =
                            Array.from(mutation.addedNodes).some(
                              (node) =>
                                node.nodeType === Node.ELEMENT_NODE &&
                                (node as Element).tagName === "IMG",
                            ) ||
                            Array.from(mutation.removedNodes).some(
                              (node) =>
                                node.nodeType === Node.ELEMENT_NODE &&
                                (node as Element).tagName === "IMG",
                            );

                          if (hasImageChanges) {
                            shouldCheck = true;
                          }
                        }

                        // Check for src changes on img elements only
                        if (
                          mutation.type === "attributes" &&
                          mutation.target.nodeType === Node.ELEMENT_NODE &&
                          (mutation.target as Element).tagName === "IMG" &&
                          mutation.attributeName === "src"
                        ) {
                          shouldCheck = true;
                        }
                      });

                      if (shouldCheck) {
                        // Single delayed check, no spam
                        setTimeout(checkForSlideChanges, 100);
                      }
                    });

                    slideObserver.observe(element, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      attributeFilter: ["src"], // Only watch src changes
                    });

                    // Listen for keyboard events (more targeted)
                    const handleKeyDown = (_e: KeyboardEvent) => {
                      if (_e.key === "ArrowLeft" || _e.key === "ArrowRight") {
                        // Check immediately and then again after delays
                        checkForSlideChanges();
                        setTimeout(checkForSlideChanges, 50);
                        setTimeout(checkForSlideChanges, 150);
                        setTimeout(checkForSlideChanges, 300);
                      }
                    };

                    document.addEventListener("keydown", handleKeyDown);

                    // Clean up when modal closes
                    const cleanupObserver = new MutationObserver(
                      (mutations) => {
                        mutations.forEach((mutation) => {
                          mutation.removedNodes.forEach((node) => {
                            if (node === element) {
                              clearInterval(slideCheckInterval);
                              slideObserver.disconnect();
                              cleanupObserver.disconnect();
                              document.removeEventListener(
                                "keydown",
                                handleKeyDown,
                              );
                              setCurrentImageId(null);
                              setPhotoSwipeContainer(null);
                            }
                          });
                        });
                      },
                    );

                    cleanupObserver.observe(document.body, {
                      childList: true,
                      subtree: true,
                    });
                  } else {
                    // Last resort: show heart button with generic ID
                    setCurrentImageId("unknown");
                  }
                }
              };

              // Start trying immediately
              trySetupListeners();
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
      isPhotoSwipeHandlerActive = false;
    };
  }, [images]); // Add images as dependency for useEffect

  return (
    <>
      <Gallery withCaption withDownloadButton options={galleryOptions}>
        {children}
      </Gallery>
      {/* Render HeartButton and CommentsButton when PhotoSwipe modal is open and we have the image ID */}
      {photoSwipeContainer &&
        currentImageId &&
        createPortal(
          <>
            <HeartButton
              imageId={currentImageId}
              onLoginRequired={onLoginRequired}
              className="modalView"
            />
            <CommentsButton
              imageId={currentImageId}
              onOpenModal={handleOpenCommentsModal}
              className="modalView"
            />
          </>,
          photoSwipeContainer,
        )}

      {/* Comments Modal */}
      {currentImageId && (
        <CommentsModal
          imageId={currentImageId}
          isOpen={isCommentsModalOpen}
          onClose={handleCloseCommentsModal}
          onLoginRequired={onLoginRequired}
        />
      )}
    </>
  );
};

export { Item };
export default PhotoSwipeWrapper;
