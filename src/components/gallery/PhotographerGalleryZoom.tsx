"use client";
import { useState, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";

import HeartButton from "@/components/buttons/HeartButton";
import CommentsLauncher from "@/components/modals/comments/CommentsLauncher";
import ImageWrapper from "@/components/wrappers/ImageWrapper";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import type { GalleryProps } from "@/types/gallery";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

const PhotographerGalleryZoom: React.FC<GalleryProps> = ({ images }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const router = useRouter();

  if (!images || images.length === 0)
    return <p>No images found for this photographer.</p>;

  // Defensive mapping: ensure each image always has a valid url and s3Progressive
  const imagesWithUrl = images.map((img) => ({
    ...img,
    url: img.s3Progressive?.[0]?.url ?? "/favicons/android-chrome-512x512.png",
    s3Progressive: Array.isArray(img.s3Progressive) ? img.s3Progressive : [],
    width: img.width ?? 900,
    height: img.height ?? 900,
    title: img.title ?? "Untitled",
    id: img.id,
    author: img.author ?? "",
    description: img.description ?? "",
  }));

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
              aspectRatio: "1/1",
              minHeight: 0,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              background: "#f8f8f8",
              cursor: "pointer",
            }}
            onClick={() => {
              setLightboxIndex(idx);
              setIsLightboxOpen(true);
            }}
          >
            <ImageWrapper
              image={img}
              imgStyleOverride={{ height: "auto" }}
              sizes="
                (max-width: 400px) 90vw,
                (max-width: 600px) 95vw,
                (max-width: 900px) 800px,
                (max-width: 1200px) 1200px,
                1600px
              "
              width={186}
              height={186}
            />
          </div>
        ))}
      </div>
      <Suspense fallback={null}>
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
          }))}
          index={lightboxIndex}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3,
            minZoom: 1,
            zoomInMultiplier: 2,
            scrollToZoom: true,
          }}
          render={{
            slide: (props) => {
              const { slide, zoom } = props;
              // Progressive zoom: pick best S3 image for current zoom scale
              const typedSlide = slide as {
                src: string;
                id?: number | string;
                author?: string;
                description?: string;
                width?: number;
                height?: number;
                s3Progressive?: Array<{ url: string; width: number }>;
                title?: string;
              };
              const imageId = typedSlide.id ?? 0;
              const safeZoom = typeof zoom === "number" && zoom > 1 ? zoom : 1;
              const safeWidth = typedSlide.width ?? 900;

              // Find best progressive image for zoom
              let bestZoomImgUrl = typedSlide.src;
              if (Array.isArray(typedSlide.s3Progressive)) {
                const found = typedSlide.s3Progressive.find(
                  (imgObj) => imgObj.width >= safeWidth * safeZoom
                );
                bestZoomImgUrl =
                  found?.url ??
                  typedSlide.s3Progressive[typedSlide.s3Progressive.length - 1]
                    ?.url ??
                  typedSlide.src;
              }

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
                      title: typedSlide.title,
                      author: typedSlide.author ?? "", // <-- ensure it's always a string
                    }}
                    imgStyleOverride={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    sizes="100vw"
                    width={typedSlide.width ?? 1920}
                    height={typedSlide.height ?? 1080}
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
                      imageId={imageId}
                      onLoginRequired={() => router.push("/auth/login")}
                    />
                    <CommentsLauncher
                      imageId={String(imageId)}
                      onLoginRequired={() => router.push("/auth/login")}
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
