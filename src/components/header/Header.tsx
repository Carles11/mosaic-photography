import Link from "next/link";
import DesktopNav from "../navigation/DesktopNav/DesktopNav";
import styles from "./header.module.css";
import { SupabaseUser } from "@/lib/supabaseClient";
// ✅ Update this import to use your new logo component
import HeroSection from "../hero/HeroSection";

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
      <h1 className="sr-only">
        Mosaic Photography: Iconic Nude Photography Gallery
      </h1>
      <nav className={styles.navContainer}>
        <ul className={styles.navGrid}>
          {isHome ? (
            <HeroSection />
          ) : (
            <li className={styles.navLogo}>
              <Link href="/" className={styles.backToHomeButton}>
                ← Return Home
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
