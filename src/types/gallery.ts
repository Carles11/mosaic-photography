// Gallery and image-related types
import { JSX } from "react";

export type ImageWithOrientation = ImageData & {
  orientation?: "vertical" | "horizontal" | "square";
  mosaicType?: "normal" | "large" | "wide" | "tall";
};

export interface GalleryProps extends JSX.IntrinsicAttributes {
  id: string;
  images?: ImageWithOrientation[];
  onLoginRequired?: () => void;
}

export interface Photographer {
  id: number;
  name: string;
  surname: string;
  author: string;
  biography?: string;
  birthdate: string;
  deceasedate?: string | null;
  origin?: string;
  website?: string;
  instagram?: string;
  images?: ImageData[];
  store?: [];
}

export interface ImageData {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  orientation?: string;
  created_at: string;
  width?: number;
  height?: number;
  className?: string;
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
