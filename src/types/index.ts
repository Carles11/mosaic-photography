export interface Photographer {
  name: string;
  surname: string;
  biography: string;
  birthdate: string;
  deceasedate: string | null;
  origin: string;
  website: string;
  instagram: string;
  images: ImageData[];
  store: [];
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

export interface Author {
  name: string;
  surname: string;
  biography: string;
  birthdate: string;
  deceasedate: string | null;
  origin: string;
  imageUrl: string;
}

export type AuthorCardProps = object;

export type ImageCardProps = object;
