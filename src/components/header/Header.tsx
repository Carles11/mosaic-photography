"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "react-tooltip";

import ThemeToggle from "../theme/ThemeToggle";
import ThemeImage from "../theme/ThemeImageDark";
import GoProModal from "@/components/modals/goProModal/GoProModal";

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
                  srcLight="/logos/svg/mosaic-high-resolution-logo-grayscale-transparent.svg"
                  srcDark="/logos/svg/mosaic-high-resolution-logo-transparent.svg"
                  srcLightMobile="/logos/svg/mosaic-high-resolution-logo-grayscale-transparent-cropped_.svg"
                  srcDarkMobile="/logos/svg/mosaic-high-resolution-logo-transparent-cropped_.svg"
                  alt="Mosaic Logo"
                  className={styles.themeImage}
                  width={0}
                  height={0}
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
