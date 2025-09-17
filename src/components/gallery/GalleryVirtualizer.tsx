import { VirtuosoMasonry } from "@virtuoso.dev/masonry";
import ImageCard from "../cards/ImageCard";
import type { ImageWithOrientation } from "@/types/gallery";
import { useCallback, useMemo } from "react";

interface VirtualizedMosaicGalleryProps {
  images: ImageWithOrientation[];
  onLoginRequired?: () => void;
}

const VirtualizedMosaicGallery: React.FC<VirtualizedMosaicGalleryProps> = ({
  images,
  onLoginRequired,
}) => {
  // Responsive column count
  const columnCount = useMemo(() => {
    if (window.innerWidth < 500) return 2;
    if (window.innerWidth < 800) return 3;
    return 4;
  }, []);

  // Item renderer
  const ItemContent = useCallback(
    ({ data }: { data: ImageWithOrientation }) => (
      <ImageCard images={[data]} onLoginRequired={onLoginRequired} />
    ),
    [onLoginRequired]
  );

  return (
    <VirtuosoMasonry
      columnCount={columnCount}
      data={images}
      ItemContent={ItemContent}
      style={{ width: "100%", overflow: "visible" }}
      initialItemCount={50}
    />
  );
};

export default VirtualizedMosaicGallery;
