import React, {
  PropsWithChildren,
  useEffect,
  useState,
  lazy,
  Suspense,
} from "react";
import { createPortal } from "react-dom";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import { ImageWithOrientation } from "@/types";
// import "photoswipe/dist/photoswipe.css";

// LAZY IMPORTS for gallery components
const Gallery = lazy(() =>
  import("react-photoswipe-gallery").then((mod) => ({ default: mod.Gallery }))
);
// Export lazy Item for use elsewhere
const Item = lazy(() =>
  import("react-photoswipe-gallery").then((mod) => ({ default: mod.Item }))
);

interface PhotoSwipeWrapperProps {
  galleryOptions?: Record<string, string | number | boolean>;
  onLoginRequired?: () => void;
  images?: Array<{ id: string | number } | ImageWithOrientation>;
}

// Global state to prevent multiple PhotoSwipe handlers
let isPhotoSwipeHandlerActive = false;

const PhotoSwipeWrapper: React.FC<
  PropsWithChildren<PhotoSwipeWrapperProps>
> = ({ children, galleryOptions, onLoginRequired, images = [] }) => {
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [photoSwipeContainer, setPhotoSwipeContainer] =
    useState<HTMLElement | null>(null);
  // Modal state and handlers are now managed by modal context

  useEffect(() => {
    // @ts-ignore
    import("photoswipe/dist/photoswipe.css");
  }, []);

  // Extract image ID directly from PhotoSwipe's slide data
  const getImageIdFromPhotoSwipe = (pswpInstance: {
    currSlide?: { data?: { id?: string | number; alt?: string } };
  }): string | null => {
    if (!pswpInstance || !pswpInstance.currSlide) {
      return null;
    }

    const slideData = pswpInstance.currSlide.data;

    if (slideData && slideData.id) {
      const imageId = String(slideData.id);
      return imageId;
    }

    if (slideData && slideData.alt) {
      const imageId = String(slideData.alt);
      return imageId;
    }

    return null;
  };

  useEffect(() => {
    if (isPhotoSwipeHandlerActive) {
      return;
    }

    isPhotoSwipeHandlerActive = true;

    const createHeartButtonContainer = (pswpElement: HTMLElement) => {
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

    const setupPhotoSwipeListeners = (pswpElement: HTMLElement): boolean => {
      let pswpInstance: unknown = (pswpElement as unknown as { pswp?: unknown })
        .pswp;

      if (!pswpInstance) {
        pswpInstance = (pswpElement as unknown as { photoswipe?: unknown })
          .photoswipe;
      }

      if (!pswpInstance) {
        pswpInstance = (window as unknown as { pswp?: unknown }).pswp;
      }

      if (!pswpInstance) {
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
        const initialImageId = getImageIdFromPhotoSwipe(
          pswpInstance as {
            currSlide?: { data?: { id?: string | number; alt?: string } };
          }
        );
        if (initialImageId) {
          setCurrentImageId(initialImageId);
        }

        (
          pswpInstance as { on: (event: string, callback: () => void) => void }
        ).on("change", () => {
          const newImageId = getImageIdFromPhotoSwipe(
            pswpInstance as {
              currSlide?: { data?: { id?: string | number; alt?: string } };
            }
          );
          if (newImageId) {
            setCurrentImageId(newImageId);
          }
        });

        (
          pswpInstance as { on: (event: string, callback: () => void) => void }
        ).on("destroy", () => {
          setCurrentImageId(null);
          setPhotoSwipeContainer(null);
        });

        return true; // Success
      }

      return false;
    };

    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== "childList") return;

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            if (element.classList?.contains("pswp")) {
              createHeartButtonContainer(element as HTMLElement);

              let attemptCount = 0;
              const maxAttempts = 10;
              const attemptInterval = 100;

              const trySetupListeners = () => {
                attemptCount++;

                const success = setupPhotoSwipeListeners(
                  element as HTMLElement
                );

                if (!success && attemptCount < maxAttempts) {
                  setTimeout(trySetupListeners, attemptInterval);
                } else if (!success) {
                  let fallbackImageId: string | null = null;

                  const currentImg = element.querySelector(
                    ".pswp__img"
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
                    const matchingImage = images.find((img) =>
                      typeof img.id === "string" || typeof img.id === "number"
                        ? currentImg.src.includes(String(img.id)) ||
                          String((img as { url?: string }).url || "").includes(
                            currentImg.src.split("/").pop() || ""
                          ) ||
                          currentImg.src.includes(
                            String((img as { url?: string }).url || "")
                              .split("/")
                              .pop() || ""
                          )
                        : false
                    );

                    if (matchingImage) {
                      fallbackImageId = String(matchingImage.id);
                    }
                  }

                  if (!fallbackImageId && images && images.length > 0) {
                    fallbackImageId = String(images[0].id);
                  }

                  if (fallbackImageId) {
                    setCurrentImageId(fallbackImageId);

                    let lastImageId = fallbackImageId;
                    let lastImageSrc = "";

                    const getCurrentImageInfo = () => {
                      const currentImg = element.querySelector(
                        ".pswp__img"
                      ) as HTMLImageElement;

                      const allImages = element.querySelectorAll(".pswp__img");

                      const visibleImg = Array.from(allImages).find((img) => {
                        const rect = img.getBoundingClientRect();
                        const isVisible = rect.width > 0 && rect.height > 0;
                        const isSubstantial =
                          rect.width > 100 && rect.height > 100;
                        const isCentered =
                          rect.x > -100 && rect.x < window.innerWidth - 100;

                        return isVisible && isSubstantial && isCentered;
                      }) as HTMLImageElement;

                      let targetImg = visibleImg;
                      if (!targetImg) {
                        const visibleImages = Array.from(allImages).filter(
                          (img) => {
                            const rect = img.getBoundingClientRect();
                            return rect.width > 0 && rect.height > 0;
                          }
                        );

                        if (visibleImages.length > 0) {
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
                            }
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
                                (img as { url?: string }).url || ""
                              ).includes(
                                targetImg.src.split("/").pop() || ""
                              ) ||
                              targetImg.src.includes(
                                String((img as { url?: string }).url || "")
                                  .split("/")
                                  .pop() || ""
                              )
                            : false
                        );

                        if (matchingImage) {
                          newImageId = String(matchingImage.id);
                        }
                      }

                      return {
                        newImageId,
                        currentImgSrc: targetImg?.src || "",
                      };
                    };

                    const checkForSlideChanges = () => {
                      const { newImageId, currentImgSrc } =
                        getCurrentImageInfo();

                      if (!newImageId && !currentImgSrc) {
                        return;
                      }

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

                    const slideCheckInterval = setInterval(
                      checkForSlideChanges,
                      200
                    );

                    const slideObserver = new MutationObserver((mutations) => {
                      let shouldCheck = false;

                      mutations.forEach((mutation) => {
                        if (mutation.type === "childList") {
                          const hasImageChanges =
                            Array.from(mutation.addedNodes).some(
                              (node) =>
                                node.nodeType === Node.ELEMENT_NODE &&
                                (node as Element).tagName === "IMG"
                            ) ||
                            Array.from(mutation.removedNodes).some(
                              (node) =>
                                node.nodeType === Node.ELEMENT_NODE &&
                                (node as Element).tagName === "IMG"
                            );

                          if (hasImageChanges) {
                            shouldCheck = true;
                          }
                        }

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
                        setTimeout(checkForSlideChanges, 100);
                      }
                    });

                    slideObserver.observe(element, {
                      childList: true,
                      subtree: true,
                      attributes: true,
                      attributeFilter: ["src"],
                    });

                    const handleKeyDown = (_e: KeyboardEvent) => {
                      if (_e.key === "ArrowLeft" || _e.key === "ArrowRight") {
                        checkForSlideChanges();
                        setTimeout(checkForSlideChanges, 50);
                        setTimeout(checkForSlideChanges, 150);
                        setTimeout(checkForSlideChanges, 300);
                      }
                    };

                    document.addEventListener("keydown", handleKeyDown);

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
                                handleKeyDown
                              );
                              setCurrentImageId(null);
                              setPhotoSwipeContainer(null);
                            }
                          });
                        });
                      }
                    );

                    cleanupObserver.observe(document.body, {
                      childList: true,
                      subtree: true,
                    });
                  } else {
                    setCurrentImageId("unknown");
                  }
                }
              };

              trySetupListeners();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      isPhotoSwipeHandlerActive = false;
    };
  }, [images]);

  return (
    <>
      <Suspense fallback={null}>
        <Gallery withCaption withDownloadButton options={galleryOptions}>
          {children}
        </Gallery>
      </Suspense>
      {photoSwipeContainer &&
        currentImageId &&
        createPortal(
          <>
            <HeartButton
              imageId={currentImageId}
              onLoginRequired={onLoginRequired}
              className="modalView"
            />
            <CommentsLauncher
              imageId={currentImageId}
              onLoginRequired={onLoginRequired}
              className="modalView"
            />
          </>,
          photoSwipeContainer
        )}

      {/* Comments modal is now handled by modal context system */}
    </>
  );
};

export { Item };
export default PhotoSwipeWrapper;
