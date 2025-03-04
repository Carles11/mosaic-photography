// import React from "react";
// import { Gallery, Item } from "react-photoswipe-gallery";
// import "photoswipe/dist/photoswipe.css";
// import styles from "./imageGalleryModal.module.css";
// import Image from "next/image";

// interface ImageGalleryModalProps {
//   images: {
//     id: number;
//     original: string;
//     thumbnail: string;
//     caption: string;
//   }[];
//   onClose: () => void;
// }

// const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
//   images,
//   onClose,
// }) => {
//   const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   return (
//     <div className={styles.imageGalleryModal} onClick={handleBackgroundClick}>
//       <button onClick={onClose} className={styles.closeButton}>
//         <Image src="/icons/close-icon.png" alt="Close" width={32} height={32} />
//       </button>

//       <Gallery withCaption id="mosaic-gallery">
//         {images.map((image, index) => (
//           <Item
//             id={image.id.toString()}
//             key={index}
//             original={image.original}
//             thumbnail={image.thumbnail}
//             caption={image.caption}
//             width="1024"
//             height="768"
//           >
//             {({ ref, open }) => (
//               <Image
//                 ref={ref as unknown as React.MutableRefObject<HTMLImageElement>}
//                 width="1024"
//                 height="768"
//                 onClick={open}
//                 src={image.thumbnail}
//                 alt={image.caption}
//                 className={styles.imageGalleryImage}
//               />
//             )}
//           </Item>
//         ))}
//       </Gallery>
//     </div>
//   );
// };

// export default ImageGalleryModal;
