import React, { PropsWithChildren } from "react";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";

interface PhotoSwipeWrapperProps {
  galleryOptions?: Record<string, string | number | boolean>;
}

const PhotoSwipeWrapper: React.FC<
  PropsWithChildren<PhotoSwipeWrapperProps>
> = ({ children, galleryOptions }) => {
  return (
    <Gallery withCaption options={galleryOptions}>
      {children}
    </Gallery>
  );
};

export { Item };
export default PhotoSwipeWrapper;
