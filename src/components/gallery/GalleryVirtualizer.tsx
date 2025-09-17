import { Masonry, RenderComponentProps } from "masonic";
import ImageCard from "../cards/ImageCard";
import type { ImageWithOrientation } from "@/types/gallery";
import { useCallback } from "react";

interface GalleryMosaicProps {
  images: ImageWithOrientation[];
  onLoginRequired?: () => void;
}

const GalleryMosaic: React.FC<GalleryMosaicProps> = ({
  images,
  onLoginRequired,
}) => {
  // Cell renderer for each image, using your ImageCard logic
  const renderImage = useCallback(
    ({ data }: RenderComponentProps<ImageWithOrientation>) => {
      console.debug("[GalleryMosaic] Rendering image", data);
      return <ImageCard images={[data]} onLoginRequired={onLoginRequired} />;
    },
    [onLoginRequired]
  );

  return (
    <Masonry<ImageWithOrientation>
      items={images}
      columnGutter={8}
      columnWidth={220}
      overscanBy={2}
      render={renderImage}
    />
  );
};

export default GalleryMosaic;
