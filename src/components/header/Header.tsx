"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

import Link from "next/link";
import { sendGTMEvent } from "@next/third-parties/google";

import ThemeImage from "../theme/ThemeImageDark";
import GoProModal from "@/components/modals/goProModal/GoProModal";
import UserMenu from "./UserMenu/UserMenu";
import { SupabaseUser } from "@/lib/supabaseClient";

import styles from "./header.module.css";

interface HeaderProps {
  showLoginButton?: boolean;
  onLoginClick?: () => void;
  user?: SupabaseUser | null;
  onLogoutClick?: () => void;
}

const Header = ({
  showLoginButton = false,
  onLoginClick,
  user,
  onLogoutClick,
}: HeaderProps) => {
  const [showGoProModal, setShowGoProModal] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const handleGoProClick = () => {
    setShowGoProModal(true);
    sendGTMEvent({
      event: "goProText",
      value: "Go Pro clicked from user menu",
    });
  };

  return (
    <header>
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
              <UserMenu
                user={user}
                onLoginClick={onLoginClick}
                onLogoutClick={onLogoutClick}
                onGoProClick={handleGoProClick}
              />
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
