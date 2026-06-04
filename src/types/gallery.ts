// Gallery and image-related types
import { JSX } from "react";

export type ImageWithOrientation = UniversalGalleryImage & {
  orientation?: "vertical" | "horizontal" | "square";
  mosaicType?: "normal" | "large" | "wide" | "tall";
};

export type PossiblePSWP = {
  on?: (event: string, cb: () => void) => void;
  currSlide?: { data?: { id?: string | number; alt?: string | number } };
};

export interface Photographer {
  id: number;
  name: string;
  surname: string;
  author: string;
  biography?: string;
  biography_md?: string;
  intro?: string;
  intro_md?: string;
  birthdate: string;
  deceasedate?: string | null;
  origin?: string;
  slug?: string;
  photographerSurname?: string;
  website?: string;
  instagram?: string;
  images?: UniversalGalleryImage[];
  store?: [];
}

// types/galleryImage.ts

export interface UniversalGalleryImage {
  id: string;
  author: string;

  title?: string;
  description?: string;

  url?: string;

  width?: number;
  height?: number;

  orientation?: "vertical" | "horizontal" | "square";
  mosaicType?: "normal" | "large" | "wide" | "tall";

  gender?: string;
  color?: string;
  nudity?: string | boolean | null;
  year?: number;

  created_at?: string;

  filename?: string;
  base_url?: string;

  s3Progressive?: Array<{
    url: string;
    width: number;
  }>;

  print_quality?: string;
}

export interface ImageData {
  id: string;
  url?: string;
  base_url?: string;
  filename?: string;
  author: string;
  orientation?: "vertical" | "horizontal" | "square";
  mosaicType?: "normal" | "large" | "wide" | "tall";
  title: string;
  description: string;
  created_at: string;
  width?: number;
  height?: number;
  s3Progressive?: Array<{
    url: string;
    width: number;
  }>;
  className?: string;
  gender?: "female" | "male" | "mixed";
  color?: string;
  nudity?: string;
  year?: number;
  print_quality?: QualityLevel;
}

export type QualityLevel =
  | "professional"
  | "excellent"
  | "good"
  | "standard"
  | "";

export interface GalleryProps extends JSX.IntrinsicAttributes {
  id?: string;
  images: UniversalGalleryImage[];
  onLoginRequired?: () => void;
}

export interface Author {
  name: string;
  surname: string;
  biography: string;
  birthdate: string;
  deceasedate: string | null;
  origin: string;
  author: string;
  website?: string;
  instagram?: string;
  store?: [];
  images: {
    id: string;
    url: string;
    author: string;
    title: string;
    description: string;
    created_at: string;
  }[];
}

export type AuthorCardProps = object;

export type ImageCardProps = {
  onLoginRequired?: () => void;
};

export type SwipeGalleryProps = {
  images: { src: string; thumbnail: string; width: number; height: number }[];
};

export type GalleryFilter = {
  orientation?: "vertical" | "horizontal" | null;
  color?: "bw" | "color" | null;
  nudity?: "nude" | "not-nude" | null;
  gender?: "male" | "female" | "mixed" | null;
  print_quality?: QualityLevel | null;
  year?: { from: number; to: number } | null;
  // Add other filter fields as needed
};

// Comment Types
export interface Comment {
  id: string;
  user_id: string;
  image_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_email?: string; // For display purposes - contains display name (not actual email for privacy)
}

export interface CommentFormData {
  content: string;
}

export type CommentsModalProps = {
  imageId: string;
  isOpen: boolean;
  onClose: () => void;
  onLoginRequired?: () => void;
};

export interface UserCommentWithImage extends Comment {
  image_title?: string;
  image_url?: string;
  image_author?: string;
  imageData?: UniversalGalleryImage; // For ImageWrapper
}

// Collections Types
export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  image_count?: number; // Computed field for display
  preview_images?: string[]; // First 4 image URLs for preview
}

export interface CollectionFavorite {
  collection_id: string;
  favorite_id: number;
  added_at: string;
}

export interface CollectionWithImages extends Collection {
  images: Array<{
    favorite_id: number;
    image_id: string;
    image_url: string;
    image_title: string;
    image_author: string;
    added_at: string;
  }>;
}

export interface ImageWrapperProps {
  image?: UniversalGalleryImage;
  images?: UniversalGalleryImage[];
  loading?: boolean;
  onLoginRequired?: () => void;
  imgStyleOverride?: React.CSSProperties;
  photographer?: boolean;
  sizes?: string;
  onLoad?: () => void;
  width?: number;
  height?: number;
  showOverlayButtons?: boolean; // Whether to show HeartButton and CommentsLauncher overlays
}
