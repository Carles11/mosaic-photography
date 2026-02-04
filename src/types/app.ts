export interface Screenshot {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface AppLandingProps {
  screenshots?: Screenshot[];
}
