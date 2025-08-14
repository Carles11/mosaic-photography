"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";
import GitHubCorner from "@/components/buttons/GitHubCorner";

import ThemeToggle from "../theme/ThemeToggle";
import ThemeImage from "../theme/ThemeImageDark";
import GoProModal from "@/components/modals/goProModal/GoProModal";

import styles from "./header.module.css";

const Header = () => {
  const [showGoProModal, setShowGoProModal] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header>
      <GitHubCorner url="https://github.com/Carles11/mosaic-photography" />
      <h2 className="sr-only">
        Mosaic Photography: Iconic Nude Photography Gallery
      </h2>
      <nav className={styles.navContainer}>
        <ul className={styles.navGrid}>
          {isHome && (
            <li className={styles.navLogo}>
              <Link href="/" className="no-fancy-link">
                <ThemeImage
                  srcLight="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436285/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-DESKTOP-light_766x541px_ooxukv.webp"
                  srcDark="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436286/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp"
                  srcLightMobile="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436165/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-mobile-light_500x353px_v6gwqg.webp"
                  srcDarkMobile="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436069/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-mobile-DARK_500x353px_szzmkn.webp"
                  alt="Mosaic Logo"
                  className={styles.themeImage}
                  priority // ensure the image is loaded immediately
                />
              </Link>
            </li>
          )}
          <li>
            <p
              className={styles.goProText}
              onClick={() => {
                setShowGoProModal(true);
                sendGTMEvent({
                  event: "goProText",
                  value: "Go Pro clicked from header"
                });
              }}
            >
              Go Pro
            </p>
          </li>

          <li>
            <div
              onClick={() =>
                sendGTMEvent({
                  event: "ThemeToggleClicked",
                  value: "Theme toggle clicked from header"
                })
              }
            >
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
