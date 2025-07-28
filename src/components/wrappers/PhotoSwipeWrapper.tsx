import React, { PropsWithChildren, useEffect, useState } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import { createPortal } from "react-dom";
import HeartButton from "@/components/buttons/HeartButton";
import "photoswipe/dist/photoswipe.css";

interface PhotoSwipeWrapperProps {
  galleryOptions?: Record<string, string | number | boolean>;
  onLoginRequired?: () => void;
  images?: Array<{ id: string | number; [key: string]: any }>; // Array of images with at least an id field
}

// Global state to prevent multiple PhotoSwipe handlers
let isPhotoSwipeHandlerActive = false;

const PhotoSwipeWrapper: React.FC<
  PropsWithChildren<PhotoSwipeWrapperProps>
> = ({ children, galleryOptions, onLoginRequired, images = [] }) => {
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [photoSwipeContainer, setPhotoSwipeContainer] =
    useState<HTMLElement | null>(null);

  // Extract image ID directly from PhotoSwipe's slide data
  const getImageIdFromPhotoSwipe = (pswpInstance: any): string | null => {
    if (!pswpInstance || !pswpInstance.currSlide) {
      return null;
    }

    const slideData = pswpInstance.currSlide.data;
    console.log("PhotoSwipe: Getting image ID from slide data:", slideData);

    // The ID should be in slideData.id (passed from our Item component)
    if (slideData && slideData.id) {
      const imageId = String(slideData.id);
      console.log("PhotoSwipe: Found image ID in slide data:", imageId);
      return imageId;
    }

    // Fallback: try to get from alt attribute
    if (slideData && slideData.alt) {
      const imageId = String(slideData.alt);
      console.log("PhotoSwipe: Using alt as image ID:", imageId);
      return imageId;
    }

    console.warn("PhotoSwipe: Could not extract image ID from slide data");
    return null;
  };

  useEffect(() => {
    // Only one instance should handle PhotoSwipe detection globally
    if (isPhotoSwipeHandlerActive) {
      return;
    }

    isPhotoSwipeHandlerActive = true;
    console.log("PhotoSwipe: This instance will handle PhotoSwipe detection");

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

    // Setup PhotoSwipe event listeners
    const setupPhotoSwipeListeners = (pswpElement: HTMLElement): boolean => {
      // Try multiple ways to access the PhotoSwipe instance
      let pswpInstance = (pswpElement as any).pswp;

      if (!pswpInstance) {
        // Try alternative property names
        pswpInstance = (pswpElement as any).photoswipe;
      }

      if (!pswpInstance) {
        // Try to find it in the global window object
        pswpInstance = (window as any).pswp;
      }

      if (!pswpInstance) {
        // Try to access through data attributes or other methods
        const pswpData = pswpElement.getAttribute("data-pswp");
        if (pswpData) {
          try {
            pswpInstance = JSON.parse(pswpData);
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }

      console.log("PhotoSwipe: setupPhotoSwipeListeners called", {
        pswpElement,
        pswpInstance: !!pswpInstance,
        pswpType: pswpInstance ? typeof pswpInstance : "undefined",
        elementProps: Object.keys(pswpElement).filter((key) =>
          key.includes("pswp"),
        ),
        windowPswp: !!(window as any).pswp,
      });

      if (pswpInstance) {
        console.log("PhotoSwipe: Found instance, setting up listeners");

        // Set initial image ID
        const initialImageId = getImageIdFromPhotoSwipe(pswpInstance);
        if (initialImageId) {
          setCurrentImageId(initialImageId);
        }

        // Listen for slide changes
        pswpInstance.on("change", () => {
          const newImageId = getImageIdFromPhotoSwipe(pswpInstance);
          console.log("PhotoSwipe: Slide changed, new image ID:", newImageId);

          if (newImageId) {
            setCurrentImageId(newImageId);
          }
        });

        // Clean up when PhotoSwipe closes
        pswpInstance.on("destroy", () => {
          console.log("PhotoSwipe: Modal closing");
          setCurrentImageId(null);
          setPhotoSwipeContainer(null);
        });

        return true; // Success
      }

      return false; // Failed to find instance
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

              // Setup event listeners with multiple attempts
              let attemptCount = 0;
              const maxAttempts = 10;
              const attemptInterval = 100; // ms

              const trySetupListeners = () => {
                attemptCount++;
                console.log(
                  `PhotoSwipe: Attempt ${attemptCount} to setup listeners`,
                );

                const success = setupPhotoSwipeListeners(
                  element as HTMLElement,
                );

                if (!success && attemptCount < maxAttempts) {
                  setTimeout(trySetupListeners, attemptInterval);
                } else if (!success) {
                  console.warn(
                    "PhotoSwipe: Failed to setup listeners after all attempts",
                  );
                  console.log(
                    "PhotoSwipe: Using fallback method - showing heart button without instance tracking",
                  );

                  // Fallback: Try to extract image ID from DOM or first image
                  let fallbackImageId = null;

                  // Try to find image ID from the current slide's img element
                  const currentImg = element.querySelector(
                    ".pswp__img",
                  ) as HTMLImageElement;

                  console.log("PhotoSwipe: Fallback - looking for image ID", {
                    currentImg: !!currentImg,
                    imgSrc: currentImg?.src,
                    imgAlt: currentImg?.alt,
                    dataImageId: currentImg?.dataset?.imageId,
                    imagesArray: images?.map((img) => ({
                      id: img.id,
                      url: img.url,
                    })),
                  });

                  if (currentImg && currentImg.dataset.imageId) {
                    fallbackImageId = currentImg.dataset.imageId;
                    console.log(
                      "PhotoSwipe: Found image ID in dataset:",
                      fallbackImageId,
                    );
                  } else if (currentImg && currentImg.alt) {
                    fallbackImageId = currentImg.alt;
                    console.log(
                      "PhotoSwipe: Using alt as image ID:",
                      fallbackImageId,
                    );
                  } else if (
                    currentImg &&
                    currentImg.src &&
                    images &&
                    images.length > 0
                  ) {
                    // Try to match the image URL with our images array
                    const matchingImage = images.find(
                      (img) =>
                        currentImg.src.includes(String(img.id)) ||
                        String(img.url || "").includes(
                          currentImg.src.split("/").pop() || "",
                        ) ||
                        currentImg.src.includes(
                          String(img.url || "")
                            .split("/")
                            .pop() || "",
                        ),
                    );

                    if (matchingImage) {
                      fallbackImageId = String(matchingImage.id);
                      console.log(
                        "PhotoSwipe: Matched image by URL:",
                        fallbackImageId,
                      );
                    }
                  }

                  if (!fallbackImageId && images && images.length > 0) {
                    // Last resort: use first image ID
                    fallbackImageId = String(images[0].id);
                    console.log(
                      "PhotoSwipe: Using first image as fallback:",
                      fallbackImageId,
                    );
                  }

                  if (fallbackImageId) {
                    console.log(
                      "PhotoSwipe: Using fallback image ID:",
                      fallbackImageId,
                    );
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

                      // Log all images for debugging (only occasionally to avoid spam)
                      if (Math.random() < 0.2) {
                        // 20% chance to log
                        console.log("PhotoSwipe: All images found:", {
                          totalImages: allImages.length,
                          images: Array.from(allImages).map((img, index) => {
                            const imgEl = img as HTMLImageElement;
                            const rect = imgEl.getBoundingClientRect();
                            return {
                              index,
                              src: imgEl.src
                                ? imgEl.src.split("/").pop()
                                : "no-src",
                              alt: imgEl.alt || "no-alt",
                              dataImageId:
                                imgEl.dataset.imageId || "no-data-id",
                              visible: rect.width > 0 && rect.height > 0,
                              size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
                              position: `x:${Math.round(rect.x)} y:${Math.round(rect.y)}`,
                            };
                          }),
                        });
                      }

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

                      // Only log target image selection occasionally or when debugging
                      // console.log("PhotoSwipe: Selected target image:", {
                      //   method: visibleImg
                      //     ? "centered"
                      //     : targetImg
                      //       ? "largest"
                      //       : "fallback",
                      //   targetSrc: targetImg?.src
                      //     ? targetImg.src.split("/").pop()
                      //     : "no-src",
                      //   targetAlt: targetImg?.alt || "no-alt",
                      //   targetDataId:
                      //     targetImg?.dataset?.imageId || "no-data-id",
                      // });

                      let newImageId = null;

                      if (targetImg && targetImg.dataset.imageId) {
                        newImageId = targetImg.dataset.imageId;
                        // console.log(
                        //   "PhotoSwipe: Found ID via dataset:",
                        //   newImageId,
                        // );
                      } else if (targetImg && targetImg.alt) {
                        newImageId = targetImg.alt;
                        // console.log(
                        //   "PhotoSwipe: Found ID via alt:",
                        //   newImageId,
                        // );
                      } else if (
                        targetImg &&
                        targetImg.src &&
                        images &&
                        images.length > 0
                      ) {
                        // Only log URL matching when there's actually a change attempt
                        // console.log("PhotoSwipe: Trying to match by URL:", {
                        //   targetSrc: targetImg.src.split("/").pop(),
                        //   availableImages: images.map((img) => ({
                        //     id: img.id,
                        //     urlPart: String(img.url || "")
                        //       .split("/")
                        //       .pop(),
                        //   })),
                        // });

                        const matchingImage = images.find(
                          (img) =>
                            targetImg.src.includes(String(img.id)) ||
                            String(img.url || "").includes(
                              targetImg.src.split("/").pop() || "",
                            ) ||
                            targetImg.src.includes(
                              String(img.url || "")
                                .split("/")
                                .pop() || "",
                            ),
                        );

                        if (matchingImage) {
                          newImageId = String(matchingImage.id);
                          // Only log when we actually find a match
                          // console.log(
                          //   "PhotoSwipe: Matched by URL to ID:",
                          //   newImageId,
                          // );
                        }
                        // Remove else logging to prevent spam
                      }

                      return {
                        newImageId,
                        currentImgSrc: targetImg?.src || "",
                        totalImages: allImages.length,
                        visibleImages: Array.from(allImages).filter((img) => {
                          const rect = img.getBoundingClientRect();
                          return rect.width > 0 && rect.height > 0;
                        }).length,
                      };
                    };

                    const checkForSlideChanges = () => {
                      const {
                        newImageId,
                        currentImgSrc,
                        totalImages,
                        visibleImages,
                      } = getCurrentImageInfo();

                      // Only check if we have valid data (avoid null states during transitions)
                      if (!newImageId && !currentImgSrc) {
                        return; // Skip this check - probably mid-transition
                      }

                      // Check if either the image ID or src changed
                      if (
                        (newImageId && newImageId !== lastImageId) ||
                        (currentImgSrc && currentImgSrc !== lastImageSrc)
                      ) {
                        console.log("PhotoSwipe: DETECTED SLIDE CHANGE", {
                          newImageId,
                          lastImageId,
                          currentImgSrc: currentImgSrc.split("/").pop(),
                          lastImageSrc: lastImageSrc.split("/").pop(),
                          totalImages,
                          visibleImages,
                          changeType:
                            newImageId !== lastImageId
                              ? "ID_CHANGE"
                              : "SRC_CHANGE",
                        });

                        if (newImageId) {
                          setCurrentImageId(newImageId);
                          lastImageId = newImageId;
                        }
                        lastImageSrc = currentImgSrc;
                      }
                      // No else logging - prevents spam when nothing changes
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
                    const handleKeyDown = (e: KeyboardEvent) => {
                      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                        console.log(
                          `PhotoSwipe: ${e.key} pressed, checking immediately`,
                        );
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
                              console.log(
                                "PhotoSwipe: Cleaning up slide detection",
                              );
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
                    console.log("PhotoSwipe: Using generic fallback ID");
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
      console.log("PhotoSwipe: Handler instance unmounted");
    };
  }, []); // No dependencies to prevent re-running

  return (
    <>
      <Gallery withCaption withDownloadButton options={galleryOptions}>
        {children}
      </Gallery>
      {/* Render HeartButton when PhotoSwipe modal is open and we have the image ID */}
      {photoSwipeContainer && currentImageId && (
        <>
          {console.log("PhotoSwipe: Rendering HeartButton", {
            photoSwipeContainer: !!photoSwipeContainer,
            currentImageId,
            isPhotoSwipeHandlerActive,
          })}
          {createPortal(
            <HeartButton
              imageId={currentImageId}
              onLoginRequired={onLoginRequired}
              className="modalView"
            />,
            photoSwipeContainer,
          )}
        </>
      )}
    </>
  );
};

export { Item };
export default PhotoSwipeWrapper;
