"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import ThemeToggle from "../theme/ThemeToggle";
import ThemeImage from "../theme/ThemeImageDark";
import GoProModal from "@/components/modals/goProModal/GoProModal";

const Tooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false } // Disable server-side rendering
);

import styles from "./header.module.css";

const Header = () => {
  const { toggleView, isMosaic } = useAppContext();
  const [showGoProModal, setShowGoProModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const handleIconClick = (view: string) => {
    if (!isHome) {
      router.push("/");
    }
    // console.log({ view });
    toggleView(view);
  };
  // console.log({ isMosaic });

  return (
    <header>
      <h2 className="sr-only">
        Mosaic Photography: Iconic Nude Photography Gallery
      </h2>
      <nav className={styles.navContainer}>
        <ul className={styles.navGrid}>
          {isHome && (
            <li className={styles.navLogo}>
              <Link href="/">
                <ThemeImage
                  srcLight="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436285/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-DESKTOP-light_766x541px_ooxukv.webp"
                  srcDark="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436286/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp"
                  srcLightMobile="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436165/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-mobile-light_500x353px_v6gwqg.webp"
                  srcDarkMobile="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436069/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-mobile-DARK_500x353px_szzmkn.webp"
                  alt="Mosaic Logo"
                  className={styles.themeImage}
                  priority // Add this prop to ensure the image is loaded immediately
                />
              </Link>
            </li>
          )}
          <li>
            <p
              className={styles.goProText}
              onClick={() => setShowGoProModal(true)}
            >
              Go Pro
            </p>{" "}
          </li>

          <li className={styles.navLinks}>
            <div>
              <div
                id="mosaic-images-icon"
                onClick={() => handleIconClick("mosaic")}
                className={`${styles.iconContainer} ${
                  isMosaic ? styles.iconActive : styles.iconInactive
                }`}
              >
                <Image
                  src="/icons/mosaic-icon-colored.png"
                  alt="Mosaic Icon"
                  width={32}
                  height={32}
                  priority={false} // Set to true for critical images
                  loading="lazy"
                />
              </div>
              <Tooltip
                anchorSelect="#mosaic-images-icon"
                content="Images gallery"
              />
            </div>

            <div>
              <div
                id="authors-list-icon"
                onClick={() => handleIconClick("authors")}
                style={{
                  backgroundColor: "transparent",
                  borderColor: !isMosaic ? "lightgray" : "transparent",
                  borderWidth: "1x",
                  borderStyle: "solid",
                  borderRadius: "50%",
                  padding: "9px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src="/icons/authors-list-icon-colored.png"
                  alt="Mosaic Icon"
                  width={32}
                  height={32}
                  priority={false} // Set to true for critical images
                  loading="lazy"
                />
              </div>
              <Tooltip
                anchorSelect="#authors-list-icon"
                content="Photographers list"
              />
            </div>
            <div>
              <ThemeToggle />
            </div>
          </li>
        </ul>
        {showGoProModal && (
          <GoProModal
            isOpen={showGoProModal}
            onClose={() => setShowGoProModal(false)}
          />
        )}
      </nav>
    </header>
  );
};

export default Header;
