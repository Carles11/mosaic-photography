import React from "react";
import { ImageWithOrientation } from "@/types/gallery";
import ImageWrapper from "@/components/wrappers/ImageWrapper";

interface ImageCardProps {
  image: ImageWithOrientation;
  onLoginRequired?: () => void;
  imgRef?: React.RefObject<HTMLImageElement | null>;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onLoginRequired,
  imgRef,
}) => {
  return (
    <ImageWrapper
      image={image}
      imgRef={imgRef}
      onLoginRequired={onLoginRequired}
    />
  );
};

export default ImageCard;
