"use client";
import { useState, lazy, Suspense } from "react";
import Image from "next/image";
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

  if (!images || images.length === 0)
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
        {images.map((img, idx) => (
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
            <ImageWrapper image={img} imgStyleOverride={{ height: "auto" }} />
          </div>
        ))}
      </div>
      <Suspense fallback={null}>
        <Lightbox
          open={isLightboxOpen}
          close={() => setIsLightboxOpen(false)}
          slides={images.map((img) => ({
            src: img.url,
            title: img.title,
            id: img.id,
          }))}
          index={lightboxIndex}
          plugins={[Zoom]}
          render={{
            slide: (props) => {
              const { slide } = props;
              const imageId = (slide as { id?: number }).id ?? 0;
              const slideWithTitle = slide as { title?: string };
              return (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    src={slide.src}
                    alt={
                      typeof slideWithTitle.title === "string"
                        ? slideWithTitle.title
                        : "Gallery Image"
                    }
                    width={1920}
                    height={1080}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    priority
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
                      background: "rgba(0,0,0,0.6)",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                      zIndex: 1001,
                    }}
                  >
                    {slideWithTitle.title || "Untitled"}
                  </div>{" "}
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
                    <HeartButton imageId={imageId} />
                    <CommentsLauncher imageId={imageId.toString()} />
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
