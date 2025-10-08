import Link from "next/link";
import DesktopNav from "../navigation/DesktopNav/DesktopNav";
import styles from "./header.module.css";
import { SupabaseUser } from "@/lib/supabaseClient";
// ✅ Update this import to use your new logo component
import ThemedLogo from "../logo/ThemedLogo";

export interface HeaderProps {
  onLoginClick?: () => void;
  user?: SupabaseUser | null;
  onLogoutClick?: () => void;
  // onGoProClick?: () => void;
  isHome?: boolean; // Pass this from parent
}

export default function Header({
  onLoginClick,
  user,
  onLogoutClick,
  // onGoProClick,
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
                {/* ✅ Use ThemedLogo here */}
                <ThemedLogo
                  alt="Mosaic Logo"
                  // Pass down theme and forceMobile if needed
                  className={styles.themeImage}
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
                // onGoProClick={onGoProClick}
              />
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
