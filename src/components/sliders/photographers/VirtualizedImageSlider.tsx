import React, { useRef } from "react";
import { List, RowComponentProps } from "react-window";
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

  // RowComponentProps has index and style
  const Row = ({ index, style }: RowComponentProps) => {
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

  return (
    <List
      defaultHeight={height}
      rowCount={images.length}
      rowHeight={itemSize}
      rowComponent={Row}
      rowProps={{}}
      style={{
        width: width,
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    />
  );
};

export default VirtualizedImageSlider;
