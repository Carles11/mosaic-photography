"use client";
import PhotoSwipeWrapper from "@/components/wrappers/PhotoSwipeWrapper";
import ImageWrapper from "@/components/wrappers/ImageWrapper";

interface PhotographerGalleryZoomProps {
  images: Array<any>;
}

const PhotographerGalleryZoom: React.FC<PhotographerGalleryZoomProps> = ({
  images,
}) => {
  if (!images || images.length === 0)
    return <p>No images found for this photographer.</p>;
  return (
    <PhotoSwipeWrapper images={images}>
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
        {images.map((img) => (
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
            }}
          >
            <ImageWrapper image={img} />
          </div>
        ))}
      </div>
    </PhotoSwipeWrapper>
  );
};

export default PhotographerGalleryZoom;
