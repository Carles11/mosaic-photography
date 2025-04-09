import Image, { ImageProps } from "next/image";
import { useTheme } from "next-themes";
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

  return (
    <>
      {resolvedTheme === "light" ? (
        <>
          <Image
            key="light-desktop"
            priority={true}
            src={srcLight}
            {...rest}
            className={`${styles.themeImage} ${styles.desktopImage}`}
            alt="Light theme mosaic photography logo"
          />
          <Image
            key="light-mobile"
            priority={true}
            src={srcLightMobile}
            {...rest}
            className={`${styles.themeImage} ${styles.mobileImage}`}
            alt="Light theme mosaic photography logo"
          />
        </>
      ) : (
        <>
          <Image
            key="dark-desktop"
            priority={true}
            src={srcDark}
            {...rest}
            className={`${styles.themeImage} ${styles.desktopImage}`}
            alt="Dark theme mosaic photography logo"
          />
          <Image
            key="dark-mobile"
            priority={true}
            src={srcDarkMobile}
            {...rest}
            className={`${styles.themeImage} ${styles.mobileImage}`}
            alt="Dark theme mosaic photography logo"
          />
        </>
      )}
    </>
  );
};

export default ThemeImage;
