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

  const width = isMobile ? 500 : 766;
  const height = isMobile ? 353 : 541;

  return (
    <Image
      priority={true}
      src={src}
      width={width}
      height={height}
      {...rest}
      className={styles.themeImage}
      alt={`${
        resolvedTheme === "light" ? "Light" : "Dark"
      } theme mosaic photography logo ${isMobile ? "mobile" : "desktop"}`}
      placeholder="blur"
      blurDataURL={dynamicBlurDataBlur}
    />
  );
};

export default ThemeImage;
