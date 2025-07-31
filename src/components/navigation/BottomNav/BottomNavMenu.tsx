import { useEffect } from "react";
import { SupabaseUser } from "@/lib/supabaseClient";
import ThemeToggle from "../../theme/ThemeToggle";
import styles from "./BottomNav.module.css";

interface BottomNavMenuProps {
  user?: SupabaseUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onGoProClick?: () => void;
  onClose: () => void;
}

const BottomNavMenu = ({
  user,
  onLoginClick,
  onLogoutClick,
  onGoProClick,
  onClose,
}: BottomNavMenuProps) => {
  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <>
      <div className={styles.menuBackdrop} onClick={onClose} />
      <div className={styles.menuModal}>
        <div className={styles.menuContent}>
          {user && (
            <div className={styles.userInfo}>
              <span className={styles.welcomeText}>Welcome, {user.email}</span>
            </div>
          )}

          <div className={styles.menuItems}>
            {!user && (
              <button className={styles.menuItem} onClick={onLoginClick}>
                <span className={styles.menuItemIcon}>🔑</span>
                Login
              </button>
            )}

            <button className={styles.menuItem} onClick={onGoProClick}>
              <span className={styles.menuItemIcon}>⭐</span>
              Go Pro
            </button>

            {user && (
              <button className={styles.menuItem} onClick={onLogoutClick}>
                <span className={styles.menuItemIcon}>🚪</span>
                Logout
              </button>
            )}

            <div className={styles.menuDivider} />

            <div className={styles.themeToggleWrapper}>
              <span className={styles.themeLabel}>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavMenu;
