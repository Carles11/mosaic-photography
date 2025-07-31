import Link from "next/link";
import { SupabaseUser } from "@/lib/supabaseClient";
import ThemeToggle from "../../theme/ThemeToggle";
import styles from "./UserMenu.module.css";

interface UserMenuDropdownProps {
  user?: SupabaseUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onGoProClick?: () => void;
  onClose: () => void;
}

const UserMenuDropdown = ({
  user,
  onLoginClick,
  onLogoutClick,
  onGoProClick,
  onClose,
}: UserMenuDropdownProps) => {
  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownContent}>
        {user ? (
          <>
            <div className={styles.userInfo}>
              <span className={styles.welcomeText}>Welcome, {user.email}</span>
            </div>

            <div className={styles.menuDivider} />

            <button className={styles.menuItem} onClick={onGoProClick}>
              <span className={styles.menuItemIcon}>⭐</span>
              Go Pro
            </button>

            <Link href="/profile" className={styles.menuItem} onClick={onClose}>
              <span className={styles.menuItemIcon}>👤</span>
              Profile
            </Link>

            <button className={styles.menuItem} onClick={onLogoutClick}>
              <span className={styles.menuItemIcon}>🚪</span>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className={styles.menuItem} onClick={onLoginClick}>
              <span className={styles.menuItemIcon}>🔑</span>
              Login
            </button>

            <button className={styles.menuItem} onClick={onGoProClick}>
              <span className={styles.menuItemIcon}>⭐</span>
              Go Pro
            </button>
          </>
        )}

        <div className={styles.menuDivider} />

        <div className={styles.themeToggleWrapper}>
          <span className={styles.themeLabel}>Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default UserMenuDropdown;
