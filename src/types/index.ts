export interface Photographer {
  name: string;
  surname: string;
  biography: string;
  birthdate: string;
  deceasedate: string | null;
  origin: string;
  website: string;
  instagram: string;
  author: string;
  images: Image[];
  store: [];
}

export interface Image {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
  className?: string;
  width: number;
  height: number;
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
