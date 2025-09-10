import Image from "next/image";

interface ThemeImageSSRProps {
  // The server already determines which src to use (light/dark, mobile/desktop)
  src: string;
  width?: number; // default: 383
  height?: number; // default: 271
  alt?: string;
  className?: string;
  priority?: boolean;
  blurDataURL?: string;
  sizes?: string;
  style?: React.CSSProperties;
}

/**
 * Server-rendered, no hooks or client logic.
 * Use this for the LCP homepage logo for optimal web vitals.
 * Pick the src, width, height in the parent (Server Component).
 */
export default function ThemeImageSSR({
  src,
  width = 383,
  height = 271,
  alt = "Mosaic Logo",
  className,
  priority = true,
  blurDataURL,
  sizes = "383px",
}: ThemeImageSSRProps) {
  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
      priority={priority}
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
      sizes={sizes}
      loading="eager"
      fetchPriority="high"
    />
  );
}
