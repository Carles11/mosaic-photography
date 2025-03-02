import Image, { ImageProps } from "next/image";
import { useTheme } from "next-themes";

type Props = Omit<ImageProps, "src" | "priority" | "loading"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;
  const { theme } = useTheme();

  return (
    <>
      {theme === "light" ? (
        <Image {...rest} src={srcLight} alt="Light theme image" />
      ) : (
        <Image {...rest} src={srcDark} alt="Dark theme image" />
      )}
    </>
  );
};

export default ThemeImage;
