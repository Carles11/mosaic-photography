"use client";

import Link from "next/link";
import { SupabaseUser } from "@/lib/supabaseClient";
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
  const handleActionAndClose = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className={styles.dropdown}>
      {user ? (
        <>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
          </div>

          <div className={styles.menuDivider} />

          <Link
            href="/profile"
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={onClose}
          >
            <span className={styles.menuIcon}>⦿</span>
            <span className={styles.menuLabel}>Profile</span>
          </Link>

          <Link
            href="/my-content"
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={onClose}
          >
            <span className={styles.menuIcon}>📋</span>
            <span className={styles.menuLabel}>My Content</span>
          </Link>

          <Link
            href="/faq"
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={onClose}
          >
            <span className={styles.menuIcon}>❓</span>
            <span className={styles.menuLabel}>FAQ</span>
          </Link>

          <button
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={() => handleActionAndClose(onGoProClick!)}
          >
            <span className={styles.menuIcon}>⭐</span>
            <span className={styles.menuLabel}>Go Pro</span>
          </button>

          <div className={styles.menuDivider} />

          <button
            className={`no-fancy-link ${styles.menuItem} ${styles.logoutItem}`}
            onClick={() => handleActionAndClose(onLogoutClick!)}
          >
            <span className={styles.menuIcon}>🚪</span>
            <span className={styles.menuLabel}>Logout</span>
          </button>
        </>
      ) : (
        <>
          <button
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={() => handleActionAndClose(onLoginClick!)}
          >
            <span className={styles.menuIcon}>🔑</span>
            <span className={styles.menuLabel}>Login</span>
          </button>

          <Link
            href="/faq"
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={onClose}
          >
            <span className={styles.menuIcon}>❓</span>
            <span className={styles.menuLabel}>FAQ</span>
          </Link>

          <button
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={() => handleActionAndClose(onGoProClick!)}
          >
            <span className={styles.menuIcon}>⭐</span>
            <span className={styles.menuLabel}>Go Pro</span>
          </button>
        </>
      )}
    </div>
  );
};

export default UserMenuDropdown;
