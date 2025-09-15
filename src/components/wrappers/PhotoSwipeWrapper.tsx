import React, {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { createPortal } from "react-dom";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import { ImageWithOrientation } from "@/types";

const Gallery = lazy(() =>
  import("react-photoswipe-gallery").then((mod) => ({ default: mod.Gallery }))
);
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

// Debounce utility
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const PhotoSwipeWrapper: React.FC<
  PropsWithChildren<PhotoSwipeWrapperProps>
> = ({ children, galleryOptions, onLoginRequired, images = [] }) => {
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [photoSwipeContainer, setPhotoSwipeContainer] =
    useState<HTMLElement | null>(null);

  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // @ts-expect-error
    import("photoswipe/dist/photoswipe.css");
  }, []);

  // ----------- FIXED: Specify a type for pswpInstance parameter -----------
  const getImageIdFromPhotoSwipe = (
    pswpInstance: {
      currSlide?: { data?: { id?: string | number; alt?: string | number } };
    } | null
  ): string | null => {
    if (!pswpInstance || !pswpInstance.currSlide) return null;
    const slideData = pswpInstance.currSlide.data;
    if (slideData?.id) return String(slideData.id);
    if (slideData?.alt) return String(slideData.alt);
    return null;
  };

  useEffect(() => {
    if (isPhotoSwipeHandlerActive) return;
    isPhotoSwipeHandlerActive = true;

    let slideCheckInterval: ReturnType<typeof setInterval> | null = null;
    let slideObserver: MutationObserver | null = null;
    let cleanupObserver: MutationObserver | null = null;
    let keydownListener: ((e: KeyboardEvent) => void) | null = null;

    // Debounced mutation handler
    const handleMutations = debounce<MutationCallback>(
      (mutations, observer) => {
        for (const mutation of mutations) {
          if (mutation.type !== "childList") continue;
          for (const node of mutation.addedNodes) {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              (node as Element).classList.contains("pswp")
            ) {
              const pswpElement = node as HTMLElement;

              // Only observe the PhotoSwipe element subtree from now on
              observerRef.current?.disconnect();

              // Create heart/comment container
              if (!pswpElement.querySelector(".pswp__heart-container")) {
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
              }

              // Try to get the PhotoSwipe instance
              let pswpInstance:
                | {
                    on?: (event: string, cb: () => void) => void;
                    currSlide?: {
                      data?: { id?: string | number; alt?: string | number };
                    };
                  }
                | undefined =
                (pswpElement as any).pswp ||
                (pswpElement as any).photoswipe ||
                (window as any).pswp;

              if (!pswpInstance) {
                const pswpData = pswpElement.getAttribute("data-pswp");
                if (pswpData) {
                  try {
                    pswpInstance = JSON.parse(pswpData);
                  } catch {}
                }
              }

              // Try event-based (preferred)
              if (pswpInstance && typeof pswpInstance.on === "function") {
                const initialImageId = getImageIdFromPhotoSwipe(pswpInstance);
                if (initialImageId) setCurrentImageId(initialImageId);

                pswpInstance.on("change", () => {
                  const newImageId = getImageIdFromPhotoSwipe(pswpInstance);
                  if (newImageId) setCurrentImageId(newImageId);
                });

                pswpInstance.on("destroy", () => {
                  setCurrentImageId(null);
                  setPhotoSwipeContainer(null);
                });
                return;
              }

              // Fallback: polling and mutation observer (only on PhotoSwipe modal subtree)
              let lastImageId: string | null = null;
              let lastImageSrc: string = "";

              const getCurrentImageInfo = () => {
                const allImages = Array.from(
                  pswpElement.querySelectorAll(".pswp__img")
                ) as HTMLImageElement[];
                const visibleImg = allImages.find((img) => {
                  const rect = img.getBoundingClientRect();
                  return (
                    rect.width > 100 &&
                    rect.height > 100 &&
                    rect.x > -100 &&
                    rect.x < window.innerWidth - 100
                  );
                });
                // ------------- FIXED: Use const instead of let -------------
                const targetImg = visibleImg || allImages[0];
                let newImageId: string | null = null;
                if (targetImg?.dataset.imageId)
                  newImageId = targetImg.dataset.imageId;
                else if (targetImg?.alt) newImageId = targetImg.alt;
                else if (targetImg?.src && images.length > 0) {
                  // ------------- FIXED: Specify type for img -------------
                  const match = images.find(
                    (img: { id: string | number; url?: string }) => {
                      const id = String(img.id);
                      const url = String(img.url || "");
                      return (
                        targetImg.src.includes(id) ||
                        url.includes(targetImg.src.split("/").pop() || "") ||
                        targetImg.src.includes(url.split("/").pop() || "")
                      );
                    }
                  );
                  if (match) newImageId = String(match.id);
                }
                return {
                  newImageId,
                  currentImgSrc: targetImg?.src || "",
                };
              };

              const checkForSlideChanges = () => {
                const { newImageId, currentImgSrc } = getCurrentImageInfo();
                if (!newImageId && !currentImgSrc) return;
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

              slideCheckInterval = setInterval(checkForSlideChanges, 250);

              // Only observe modal subtree for added/removed images
              slideObserver = new MutationObserver(() => {
                setTimeout(checkForSlideChanges, 80);
              });
              slideObserver.observe(pswpElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["src"],
              });

              keydownListener = (e: KeyboardEvent) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  checkForSlideChanges();
                  setTimeout(checkForSlideChanges, 50);
                  setTimeout(checkForSlideChanges, 150);
                }
              };
              document.addEventListener("keydown", keydownListener);

              // Cleanup when PhotoSwipe element removed
              cleanupObserver = new MutationObserver(
                (mutations: MutationRecord[]) => {
                  for (const mutation of mutations) {
                    for (const removed of Array.from(mutation.removedNodes)) {
                      if (removed === pswpElement) {
                        if (slideCheckInterval)
                          clearInterval(slideCheckInterval);
                        slideObserver?.disconnect();
                        cleanupObserver?.disconnect();
                        if (keydownListener)
                          document.removeEventListener(
                            "keydown",
                            keydownListener
                          );
                        setCurrentImageId(null);
                        setPhotoSwipeContainer(null);
                      }
                    }
                  }
                }
              );
              cleanupObserver.observe(document.body, {
                childList: true,
                subtree: true,
              });

              // Stop further mutation handling for now
              break;
            }
          }
        }
      },
      80
    );

    // Initial observer: only look for .pswp modals being added
    observerRef.current = new MutationObserver(handleMutations);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
      if (slideCheckInterval) clearInterval(slideCheckInterval);
      slideObserver?.disconnect();
      cleanupObserver?.disconnect();
      if (keydownListener)
        document.removeEventListener("keydown", keydownListener);
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
    </>
  );
};

export { Item };
export default PhotoSwipeWrapper;
