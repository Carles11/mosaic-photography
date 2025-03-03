export interface Photographer {
  name: string;
  surname: string;
  biography: string;
  birthdate: string;
  deceasedate: string | null;
  origin: string;
  images: Image[];
}

export interface Image {
  id: string;
  url: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
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
