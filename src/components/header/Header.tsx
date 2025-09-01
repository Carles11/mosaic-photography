import Link from "next/link";
import DesktopNav from "../navigation/DesktopNav/DesktopNav";
import styles from "./header.module.css";
import { SupabaseUser } from "@/lib/supabaseClient";
import ThemeImageSSR from "../theme/ThemeImageSSR";

export interface HeaderProps {
  onLoginClick?: () => void;
  user?: SupabaseUser | null;
  onLogoutClick?: () => void;
  onGoProClick?: () => void;
  isHome?: boolean; // Pass this from parent
}

export default function Header({
  onLoginClick,
  user,
  onLogoutClick,
  onGoProClick,
  isHome = false,
}: HeaderProps) {
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
                <ThemeImageSSR
                  src="https://res.cloudinary.com/dktizqbky/image/upload/f_auto,q_auto/v1745436285/mosaic.photography/logos/WEBPs/used-in-app/mosaic-high-resolution-logo-grayscale-transparent-DESKTOP-light_766x541px_ooxukv.webp"
                  width={383}
                  height={271}
                  alt="Mosaic Logo"
                  className={styles.themeImage}
                  priority
                  blurDataURL="https://dummyimage.com/766x541/000/fff&text=mosaic+photography.png"
                  sizes="383px"
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
      </nav>
    </header>
  );
}
