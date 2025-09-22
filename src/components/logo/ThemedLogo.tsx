import React from "react";
import Image from "next/image";
import useIsMobile from "../../hooks/useIsMobile";
import { useTheme } from "next-themes";

type ThemedLogoProps = {
  /** Optionally override mobile/desktop, otherwise will detect */
  forceMobile?: boolean;
  /** Alt text for logo */
  alt?: string;
  /** Extra className for styling */
  className?: string;
};

const LOGO_URLS = {
  desktop: {
    dark: "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp",
    light:
      "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-grayscale-transparent-DESKTOP-light_766x541px_ooxukv.webp",
  },
  mobile: {
    dark: "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-grayscale-transparent-mobile-DARK_500x353px_szzmkn.webp",
    light:
      "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-grayscale-transparent-mobile-light_500x353px_v6gwqg.webp",
  },
};

const ThemedLogo: React.FC<ThemedLogoProps> = ({
  forceMobile,
  alt = "Mosaic Photography Logo",
  className = "",
}) => {
  const isMobile = useIsMobile(768);
  const effectiveIsMobile =
    typeof forceMobile === "boolean" ? forceMobile : isMobile;

  // Use next-themes for theme detection
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  const logoUrl = effectiveIsMobile
    ? LOGO_URLS.mobile[theme]
    : LOGO_URLS.desktop[theme];

  // Next/Image loader for Cloudinary (identity)
  const cloudinaryLoader = ({ src }: { src: string }) => src;

  return (
    <Image
      src={logoUrl}
      alt={alt}
      width={effectiveIsMobile ? 500 : 766}
      height={effectiveIsMobile ? 353 : 541}
      className={className}
      loader={cloudinaryLoader}
      priority
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
      sizes="(max-width: 600px) 250px, (max-width: 1200px) 500px, 766px"
    />
  );
};

export default ThemedLogo;
