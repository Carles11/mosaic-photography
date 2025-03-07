import Image, { ImageProps } from "next/image";
import { useTheme } from "next-themes";
import styles from "./ThemeImage.module.css";

type Props = Omit<ImageProps, "src" | "priority" | "loading"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;
  const { resolvedTheme } = useTheme();

  return (
    <>
      {resolvedTheme === "light" ? (
        <Image
          key="light"
          priority={true}
          {...rest}
          src={srcLight}
          alt="Light theme mosaic photography logo"
          className={styles.themeImage}
        />
      ) : (
        <Image
          key="dark"
          priority={true}
          {...rest}
          src={srcDark}
          alt="Dark theme mosaic photography logo"
          className={styles.themeImage}
        />
      )}
    </>
  );
};

export default ThemeImage;
