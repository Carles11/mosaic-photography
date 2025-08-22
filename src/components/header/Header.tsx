"use client";
// import { useState } from "react";
import { usePathname } from "next/navigation";

import Link from "next/link";
// import { sendGTMEvent } from "@next/third-parties/google";
// import GitHubCorner from "@/components/buttons/GitHubCorner";

import ThemeImage from "../theme/ThemeImageDark";
import DesktopNav from "../navigation/DesktopNav/DesktopNav";
import styles from "./header.module.css";
// import GoProModal from "@/components/modals/goProModal/GoProModal";
import { SupabaseUser } from "@/lib/supabaseClient";

interface HeaderProps {
  onLoginClick?: () => void;
  user?: SupabaseUser | null;
  onLogoutClick?: () => void;
}

interface HeaderWithProProps extends HeaderProps {
  onGoProClick?: () => void;
}

const Header = ({
  onLoginClick,
  user,
  onLogoutClick,
  onGoProClick,
}: HeaderWithProProps) => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header>
      {/* <GitHubCorner url="https://github.com/Carles11/mosaic-photography" /> */}
      <h2 className="sr-only">
        Mosaic Photography: Iconic Nude Photography Gallery
      </h2>
      <nav className={styles.navContainer}>
        <ul className={styles.navGrid}>
          {isHome ? (
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
          ) : (
            <li className={styles.navLogo}>
              <Link href="/" className={styles.backToHomeButton}>
                ← Return to Mosaic
              </Link>
            </li>
          )}
          <li className={`${styles.actionSection} ${styles.desktopOnly}`}>
            <div className={styles.rightActions}>
              <DesktopNav
                user={user}
                onLoginClick={onLoginClick}
                onLogoutClick={onLogoutClick}
                onGoProClick={onGoProClick}
              />
            </div>
          </li>
        </ul>
        {/* GoProModal is now handled at the HomeClient level */}
      </nav>
    </header>
  );
};

export default Header;
