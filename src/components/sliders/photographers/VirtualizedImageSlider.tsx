import React, { useRef } from "react";
import * as RW from "react-window";
import ImageWrapper from "../../wrappers/ImageWrapper";
import styles from "../cards/PhotographersViewCard.module.css";
import { ImageData } from "@/types/gallery";

interface VirtualizedImageSliderProps {
  images: ImageData[];
  height?: number;
  width?: number | string;
  itemSize?: number;
  onLoginRequired?: () => void;
}

const VirtualizedImageSlider: React.FC<VirtualizedImageSliderProps> = ({
  images,
  height = 480,
  width = "100%",
  itemSize = 320,
  onLoginRequired,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);

  // The row renderer receives { index, style }
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const image = images[index];
    return (
      <div style={style} className={styles.imageContainer}>
        <ImageWrapper
          image={image}
          imgRef={imgRef}
          onLoginRequired={onLoginRequired}
        />
      </div>
    );
  };

  const VirtualList = (RW as any).List as React.ComponentType<any>;

  return (
    <VirtualList
      height={height}
      width={width}
      itemCount={images.length}
      itemSize={itemSize}
      layout="horizontal"
    >
      {Row as any}
    </VirtualList>
  );
};

export default VirtualizedImageSlider;
