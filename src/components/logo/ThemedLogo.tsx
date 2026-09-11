import React from "react";
import Image from "next/image";
import useIsMobile from "../../hooks/useIsMobile";
import styles from "./ThemedLogo.module.css";

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
    dark: "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp",
    light:
      "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-grayscale-transparent-DESKTOP-light_766x541px_ooxukv.webp",
    // dark: "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-grayscale-transparent-mobile-DARK_500x353px_szzmkn.webp",
    // light:
    //   "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-grayscale-transparent-mobile-light_500x353px_v6gwqg.webp",
  },
};

/**
 * Theme-aware logo.
 *
 * Both variants are rendered and CSS picks one via `[data-theme]` on `<html>`
 * (see ThemedLogo.module.css). Choosing the URL in JS with `useTheme()` broke
 * once the site became server-rendered (2026-09-11): the server does not know
 * next-themes' resolved theme and emitted the light logo, the client's first
 * render already knew "dark" from localStorage, and React does not repair
 * attribute mismatches during hydration — so the DOM kept the light `src`
 * until the user toggled the theme twice. Letting CSS decide removes the
 * dependency on hydration order entirely: `data-theme` is set from the cookie
 * on the server and by next-themes' inline script before first paint.
 *
 * The hidden variant is `display: none` with `loading="lazy"`, so browsers
 * never fetch it.
 */
const ThemedLogo: React.FC<ThemedLogoProps> = ({
  forceMobile,
  alt = "Mosaic Photography Logo",
  className = "",
}) => {
  const isMobile = useIsMobile(768);
  const effectiveIsMobile =
    typeof forceMobile === "boolean" ? forceMobile : isMobile;

  const urls = effectiveIsMobile ? LOGO_URLS.mobile : LOGO_URLS.desktop;
  const width = effectiveIsMobile ? 500 : 766;
  const height = effectiveIsMobile ? 353 : 541;
  const sizes = "(max-width: 600px) 250px, (max-width: 1200px) 500px, 766px";

  return (
    <>
      <Image
        src={urls.dark}
        alt={alt}
        width={width}
        height={height}
        className={`${styles.logoDark} ${className}`}
        loading="lazy"
        style={{ maxWidth: "100%", height: "auto" }}
        sizes={sizes}
      />
      <Image
        src={urls.light}
        alt={alt}
        width={width}
        height={height}
        className={`${styles.logoLight} ${className}`}
        loading="lazy"
        style={{ maxWidth: "100%", height: "auto" }}
        sizes={sizes}
      />
    </>
  );
};

export default ThemedLogo;
