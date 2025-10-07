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
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import type { GalleryProps } from "@/types/gallery";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

const PhotographerGalleryZoom: React.FC<GalleryProps> = ({
  images,
  onLoginRequired,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const router = useRouter();
  const { currentModal } = useModal();

  // Track previous modal and last lightbox index for restore logic
  const lastLightboxIndex = useRef<number | null>(null);
  const prevModal = useRef<string>(null);

  // Defensive mapping: ensure each image always has a valid url and s3Progressive, and created_at
  const imagesWithUrl = useMemo(
    () =>
      images?.map((img) => ({
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
        description: img.description ?? "",
        created_at: img.created_at ?? "",
      })),
    [images]
  );

  // Save last lightbox index before closing for modal
  useEffect(() => {
    if (currentModal && isLightboxOpen) {
      lastLightboxIndex.current = lightboxIndex;
      setIsLightboxOpen(false);
    }
  }, [currentModal, isLightboxOpen, lightboxIndex]);

  // Restore lightbox when modal closes
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

  const openLightbox = useCallback((idx: number) => {
    setLightboxIndex(
      lastLightboxIndex.current !== null ? lastLightboxIndex.current : idx
    );
    setIsLightboxOpen(true);
    lastLightboxIndex.current = null;
  }, []);

  if (!imagesWithUrl || imagesWithUrl.length === 0)
    return <p>No images found for this photographer.</p>;

  return (
    <>
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
        {imagesWithUrl.map((img, idx) => (
          <div
            key={img.id}
            style={{
              position: "relative",
              width: "100%",
              height: "auto",
              aspectRatio: "1/1",
              minHeight: 0,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              background: "#f8f8f8",
              cursor: "pointer",
            }}
            onClick={() => openLightbox(idx)}
          >
            <ImageWrapper
              image={img}
              onLoginRequired={onLoginRequired}
              sizes="
                (max-width: 480px) 160px,
                (max-width: 768px) 180px,
                200px
              "
              width={186}
              height={186}
            />
          </div>
        ))}
      </div>
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
            download:
              img.filename && img.base_url
                ? {
                    url: `${img.base_url}/originals/${img.filename}`,
                    filename: img.filename,
                  }
                : undefined,
          }))}
          index={lightboxIndex}
          plugins={[Zoom, Download]} // <-- Add Download plugin
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
                width?: number;
                height?: number;
                s3Progressive?: Array<{ url: string; width: number }>;
                title?: string;
                created_at?: string;
              };
              const safeZoom = typeof zoom === "number" && zoom > 1 ? zoom : 1;
              const safeWidth = typedSlide.width ?? 900;
              const bestZoomImgUrl = getProgressiveZoomSrc(
                typedSlide.s3Progressive || [],
                safeZoom,
                safeWidth,
                typedSlide.src
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
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 20,
                      width: "100%",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.2rem",
                      padding: "16px 24px 24px 24px",
                      background: "rgba(0,0,0,0.2)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1001,
                    }}
                  >
                    {typedSlide.author || "Untitled"}
                  </div>
                  <ImageWrapper
                    image={{
                      ...typedSlide,
                      id: String(typedSlide.id ?? ""),
                      url: bestZoomImgUrl,
                      width: typedSlide.width ?? 1920,
                      height: typedSlide.height ?? 1080,
                      title: typedSlide.title ?? "",
                      author: typedSlide.author ?? "",
                      created_at: typedSlide.created_at ?? "",
                      description: typedSlide.description ?? "",
                    }}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    sizes="100vw"
                    width={typedSlide.width ?? 1920}
                    height={typedSlide.height ?? 1080}
                    showOverlayButtons={false}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: "100%",
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "1.2rem",
                      padding: "16px 24px 24px 24px",
                      background: "rgba(0,0,0,0.2)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1001,
                    }}
                  >
                    {typedSlide.description || ""}
                  </div>
                  <div
                    style={{
                      position: "fixed",
                      bottom: 20,
                      right: 20,
                      zIndex: 9999,
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
            view: ({ index }) => setLightboxIndex(index),
          }}
        />
      </Suspense>
    </>
  );
};

export default PhotographerGalleryZoom;
