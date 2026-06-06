"use client";
import {
  useState,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/context/modalContext/useModal";
import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import { getProgressiveZoomSrc } from "@/utils/imageResizingS3";
import { handleDownloadOptionClick } from "@/utils/handleDownloadOptionClick";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import type { GalleryProps } from "@/types/gallery";
import styles from "./photographerGalleryZoom.module.css";
import { useAuthSession } from "@/context/AuthSessionContext";
import toast from "react-hot-toast";
import { sendGTMEvent } from "@next/third-parties/google";
import { useComments } from "@/context/CommentsContext";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

const PhotographerGalleryZoom: React.FC<GalleryProps> = ({
  images,
  onLoginRequired,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<string>("");
  const [nudityFilter, setNudityFilter] = useState<"all" | "nude" | "not-nude">(
    "all",
  );

  const router = useRouter();
  const { user } = useAuthSession();
  const { currentModal, open: openModal } = useModal();
  const lastLightboxIndex = useRef<string | null>(null);
  const prevModal = useRef<string>(null);
  const { loadCommentCountsBatch } = useComments();

  useEffect(() => {
    const imageIds = images?.map((img) => String(img.id));

    if (imageIds && imageIds.length > 0) {
      loadCommentCountsBatch(imageIds);
    }
  }, [images, loadCommentCountsBatch]);

  // Pre-calculate filter dynamic category counts accurately across variable tables
  const counts = useMemo(() => {
    if (!images) return { all: 0, nude: 0, notNude: 0 };
    let nude = 0;
    let notNude = 0;
    images.forEach((img) => {
      const isNude =
        img.nudity === true || String(img.nudity).toLowerCase() === "true";
      if (isNude) {
        nude++;
      } else {
        notNude++;
      }
    });
    return { all: images.length, nude, notNude };
  }, [images]);

  // Defensive mapping & active list filtering matching user criteria
  const imagesWithUrl = useMemo(() => {
    if (!images) {
      console.log("📸 [GALLERY DEBUG] No images provided to component.");
      return [];
    }

    if (images.length > 0) {
      console.log(
        "📸 [GALLERY DEBUG] Raw First Image from DB:",
        JSON.stringify(images[0], null, 2),
      );
    }

    // Filter incoming rows based on the active nudity filter state
    const filtered = images.filter((img) => {
      const isNude =
        img.nudity === true || String(img.nudity).toLowerCase() === "true";
      if (nudityFilter === "nude") return isNude;
      if (nudityFilter === "not-nude") return !isNude;
      return true;
    });

    const mapped = filtered.map((img) => {
      return {
        ...img,
        url:
          img.s3Progressive?.[0]?.url ?? "/favicons/android-chrome-512x512.png",
        s3Progressive: Array.isArray(img.s3Progressive)
          ? img.s3Progressive
          : [],
        width: img.width ?? 900,
        height: img.height ?? 900,
        title: img.title ?? "Untitled",
        id: img.id,
        author: img.author ?? "",
        year: img.year ?? "",
        description: img.description ?? "",
        created_at: img.created_at ?? "",
        orientation: img.orientation,
      };
    });

    if (mapped.length > 0) {
      console.log("📸 [GALLERY DEBUG] Mapped First Image Configuration:", {
        id: mapped[0].id,
        title: mapped[0].title,
        width: mapped[0].width,
        height: mapped[0].height,
        orientation: mapped[0].orientation,
      });
    }

    return mapped;
  }, [images, nudityFilter]);

  useEffect(() => {
    if (currentModal && isLightboxOpen) {
      lastLightboxIndex.current = lightboxIndex;
      setIsLightboxOpen(false);
    }
  }, [currentModal, isLightboxOpen, lightboxIndex]);

  useEffect(() => {
    if (
      prevModal.current &&
      !currentModal &&
      lastLightboxIndex.current !== null
    ) {
      setLightboxIndex(lastLightboxIndex.current);
      setIsLightboxOpen(true);
      lastLightboxIndex.current = null;
    }
    prevModal.current = currentModal;
  }, [currentModal]);

  const openLightbox = useCallback((id: string) => {
    setLightboxIndex(id);
    setIsLightboxOpen(true);
    lastLightboxIndex.current = null;
  }, []);

  const handleLoginRequired = useCallback(() => {
    toast.error("Please log in to download images.");
    setTimeout(() => {
      router.push("/auth/login");
    }, 1200);
  }, [router]);

  const DownloadIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect width="22" height="22" rx="11" fill="rgba(244,211,94,0.10)" />
      <path
        d="M11 6.5v5m0 0-2.5-2.5m2.5 2.5 2.5-2.5M5.833 15.5h10.334"
        stroke="#F4D35E"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Safely compute lookahead index matching target Lightbox constraints
  const computedActiveIndex = useMemo(() => {
    const foundIdx = imagesWithUrl.findIndex(
      (img) => String(img.id) === String(lightboxIndex),
    );
    return foundIdx === -1 ? 0 : foundIdx;
  }, [imagesWithUrl, lightboxIndex]);

  if (!imagesWithUrl || (imagesWithUrl.length === 0 && nudityFilter === "all"))
    return <p>No images found for this photographer.</p>;

  return (
    <>
      {/* 🌟 Functional Filtering Pill Rows Container */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto 24px auto",
          padding: "0 4px",
        }}
      >
        <button
          onClick={() => setNudityFilter("all")}
          className={`${styles.nudityPill} ${nudityFilter === "all" ? styles.nudityPillActive : ""}`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setNudityFilter("not-nude")}
          className={`${styles.nudityPill} ${nudityFilter === "not-nude" ? styles.nudityPillActive : ""}`}
        >
          Safe ({counts.notNude})
        </button>
        <button
          onClick={() => setNudityFilter("nude")}
          className={`${styles.nudityPill} ${nudityFilter === "nude" ? styles.nudityPillActive : ""}`}
        >
          Nude ({counts.nude})
        </button>
      </div>

      {imagesWithUrl.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            width: "100%",
            padding: "40px 0",
            color: "#6b7280",
          }}
        >
          No images match the selected filter criteria.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 16,
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          {imagesWithUrl.map((img) => (
            <div
              key={img.id}
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                background: "#f8f8f8",
                cursor: "pointer",
              }}
              onClick={() => openLightbox(String(img.id))}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <ImageWrapper
                  image={{
                    ...img,
                    year: typeof img.year === "number" ? img.year : undefined,
                  }}
                  onLoginRequired={onLoginRequired}
                  sizes="(max-width: 480px) 160px, (max-width: 768px) 180px, 200px"
                  width={400}
                  height={400}
                  imgStyleOverride={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Suspense
        fallback={
          <div style={{ textAlign: "center", padding: "2em" }}>
            <div
              className="spinner"
              style={{
                margin: "0 auto",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "4px solid #ccc",
                borderTop: "4px solid #333",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p>Loading lightbox...</p>
          </div>
        }
      >
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={imagesWithUrl.map((img) => ({
            src: img.url,
            title: img.title,
            id: img.id,
            author: img.author,
            description: img.description,
            width: img.width,
            height: img.height,
            s3Progressive: img.s3Progressive,
            created_at: img.created_at,
            year: img.year ?? "",
            download:
              img.filename && img.base_url
                ? {
                    url: `${img.base_url}/originals/${img.filename}`,
                    filename: img.filename,
                  }
                : undefined,
          }))}
          index={computedActiveIndex}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3,
            minZoom: 1,
            zoomInMultiplier: 2,
            scrollToZoom: true,
          }}
          render={{
            slide: ({ slide, zoom }) => {
              const typedSlide = slide as {
                src: string;
                id?: number | string;
                author?: string;
                description?: string;
                year?: string | number;
                width?: number;
                height?: number;
                s3Progressive?: Array<{ url: string; width: number }>;
                title?: string;
                created_at?: string;
                download?: { url?: string; filename?: string };
              };

              const realTimeSlideData = imagesWithUrl.find(
                (i) => String(i.id) === String(typedSlide.id),
              );
              const safeZoom = typeof zoom === "number" && zoom > 1 ? zoom : 1;
              const safeWidth =
                realTimeSlideData?.width ?? typedSlide.width ?? 900;

              const bestZoomImgUrl = getProgressiveZoomSrc(
                typedSlide.s3Progressive || [],
                safeZoom,
                safeWidth,
                typedSlide.src,
              );

              return (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <div
                    className={styles.lightboxAuthor}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "22px",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.2rem",
                      padding: "11px",
                      background: "rgba(0,0,0,0.2)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span>
                      {(typedSlide.author || "Unknown Author") +
                        ", " +
                        (typedSlide.year || "Unknown Year")}
                    </span>
                  </div>

                  <ImageWrapper
                    image={{
                      ...typedSlide,
                      id: String(typedSlide.id ?? ""),
                      url: bestZoomImgUrl,
                      width: realTimeSlideData?.width ?? 900,
                      height: realTimeSlideData?.height ?? 900,
                      title: typedSlide.title ?? "",
                      author: typedSlide.author ?? "",
                      created_at: typedSlide.created_at ?? "",
                      description: typedSlide.description ?? "",
                      year:
                        typeof typedSlide.year === "number"
                          ? typedSlide.year
                          : undefined,
                    }}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    sizes="100vw"
                    width={realTimeSlideData?.width ?? 900}
                    height={realTimeSlideData?.height ?? 900}
                    showOverlayButtons={false}
                  />

                  <div
                    className={styles.lightboxDescription}
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: "100%",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.04rem",
                      padding: "16px 24px 64px 24px",
                      background: "rgba(0,0,0,0.4)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1001,
                      maxHeight: "28vh",
                      overflowY: "auto",
                      boxSizing: "border-box",
                      pointerEvents: "auto",
                      marginBottom: "0",
                    }}
                  >
                    {typedSlide.description || ""}
                  </div>

                  <div
                    className={styles.lightboxButtonRow}
                    style={{
                      position: "fixed",
                      bottom: 20,
                      right: 20,
                      zIndex: 2000,
                      display: "flex",
                      gap: "10px",
                      pointerEvents: "auto",
                    }}
                  >
                    <HeartButton
                      imageId={String(typedSlide.id ?? "")}
                      onLoginRequired={
                        onLoginRequired || (() => router.push("/auth/login"))
                      }
                    />
                    <CommentsLauncher
                      imageId={String(typedSlide.id ?? "")}
                      onLoginRequired={
                        onLoginRequired || (() => router.push("/auth/login"))
                      }
                    />
                  </div>
                </div>
              );
            },
          }}
          on={{
            view: ({ index }) => {
              const currentTargetImg = imagesWithUrl[index];
              if (currentTargetImg)
                setLightboxIndex(String(currentTargetImg.id));
            },
          }}
          toolbar={{
            buttons: [
              (() => {
                const currentSlide = imagesWithUrl.find(
                  (img) => String(img.id) === String(lightboxIndex),
                );
                const downloadUrl =
                  currentSlide?.filename && currentSlide?.base_url
                    ? `${currentSlide.base_url}/originals/${currentSlide.filename}`
                    : null;

                if (!downloadUrl) {
                  return (
                    <button
                      key="download"
                      className={styles.lightboxDownloadButton}
                      style={{ opacity: 0.5 }}
                      disabled
                    >
                      <DownloadIcon />
                    </button>
                  );
                }

                return (
                  <button
                    key="download"
                    className={styles.lightboxDownloadButton}
                    onClick={() => {
                      if (!currentSlide?.base_url || !currentSlide?.filename)
                        return;
                      openModal("downloadOptions", {
                        image: {
                          base_url: currentSlide.base_url,
                          filename: currentSlide.filename,
                          width: currentSlide.width,
                          height: currentSlide.height,
                          print_quality: currentSlide.print_quality,
                        },
                        title: "Choose your option",
                        onClose: () => {},
                        onDownloadOption: async (option) => {
                          handleDownloadOptionClick({
                            option,
                            user,
                            originalFilename: currentSlide.filename,
                            eventName: "downloadInPhotographerClicked",
                            onRequireLogin: handleLoginRequired,
                            trackEvent: (eventName, value) => {
                              sendGTMEvent({ event: eventName, value });
                            },
                            onErrorFallback: (err) => {
                              console.error(err);
                            },
                          });
                        },
                      });
                    }}
                  >
                    <DownloadIcon />
                  </button>
                );
              })(),
              "close",
            ],
          }}
        />
      </Suspense>
    </>
  );
};

export default PhotographerGalleryZoom;
