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
            width={766}
            height={541}
            {...rest}
            className={`${styles.themeImage} ${styles.desktopImage}`}
            alt="Light theme mosaic photography logo desktop"
          />
          <Image
            key="light-mobile"
            priority={true}
            src={srcLightMobile}
            width={500}
            height={353}
            {...rest}
            className={`${styles.themeImage} ${styles.mobileImage}`}
            alt="Light theme mosaic photography logo mobile"
          />
        </>
      ) : (
        <>
          <Image
            key="dark-desktop"
            priority={true}
            src={srcDark}
            width={766}
            height={541}
            {...rest}
            className={`${styles.themeImage} ${styles.desktopImage}`}
            alt="Dark theme mosaic photography logo desktop"
          />
          <Image
            key="dark-mobile"
            priority={true}
            src={srcDarkMobile}
            width={500}
            height={353}
            {...rest}
            className={`${styles.themeImage} ${styles.mobileImage}`}
            alt="Dark theme mosaic photography logo mobile"
          />
        </>
      )}
    </>
  );
};

export default ThemeImage;
