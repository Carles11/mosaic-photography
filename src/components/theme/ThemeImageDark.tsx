import Image, { ImageProps } from "next/image";
import { useTheme } from "next-themes";
import useIsMobile from "@/hooks/useIsMobile";

import styles from "./ThemeImage.module.css";

type Props = Omit<ImageProps, "src" | "priority" | "loading"> & {
  srcLight: string;
  srcDark: string;
  srcLightMobile: string;
  srcDarkMobile: string;
  priority?: boolean;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, srcLightMobile, srcDarkMobile, ...rest } = props;
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();

  const src =
    resolvedTheme === "light"
      ? isMobile
        ? srcLightMobile
        : srcLight
      : isMobile
        ? srcDarkMobile
        : srcDark;

  const dynamicBlurDataBlur = isMobile
    ? "https://dummyimage.com/500x353/000/fff&text=mosaic+photography.png"
    : "https://dummyimage.com/766x541/000/fff&text=mosaic+photography.png";

  // Set the display dimensions (half of the actual image size)
  const displayWidth = isMobile ? 250 : 383;
  const displayHeight = isMobile ? 176 : 271;

  // Set the source dimensions (full size for quality)
  const sourceWidth = isMobile ? 500 : 766;
  const sourceHeight = isMobile ? 353 : 541;

  return (
    <Image
      priority={true}
      src={src}
      width={displayWidth} // Use the display dimensions
      height={displayHeight}
      // Remove layout="intrinsic" - it's deprecated
      sizes={isMobile ? "250px" : "383px"} // Explicitly tell Next.js what size to serve
      {...rest}
      className={styles.themeImage}
      alt={`${
        resolvedTheme === "light" ? "Light" : "Dark"
      } theme mosaic photography logo ${isMobile ? "mobile" : "desktop"}`}
      placeholder="blur"
      blurDataURL={dynamicBlurDataBlur}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
};

export default ThemeImage;
