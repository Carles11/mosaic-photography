import Image, { ImageProps } from "next/image";
import { useTheme } from "next-themes";

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
        <Image key="light" {...rest} src={srcLight} alt="Light theme image" />
      ) : (
        <Image key="dark" {...rest} src={srcDark} alt="Dark theme image" />
      )}
    </>
  );
};

export default ThemeImage;
