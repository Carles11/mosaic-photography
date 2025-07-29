export interface Photographer {
  name: string;
  surname: string;
  author: string;
  biography?: string;
  birthdate: string;
  deceasedate?: string | null;
  origin?: string;
  website?: string;
  instagram?: string;
  images: ImageData[];
  store?: [];
}

export interface ImageData {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
  width?: number;
  height?: number;
  className?: string;
}

export type ImageWithOrientation = ImageData & {
  orientation: "landscape" | "portrait";
  mosaicType?: "normal" | "large" | "wide" | "tall";
};

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

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  instagram: string;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  image_id: string;
  created_at: string;
}

// Comment Types
export interface Comment {
  id: string;
  user_id: string;
  image_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_email?: string; // For display purposes, fetched via join
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

declare module "js-cookie";
