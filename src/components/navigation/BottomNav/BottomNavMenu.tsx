"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./BottomNav.module.css";
import { SupabaseUser } from "@/lib/supabaseClient";
import ThemeToggle from "@/components/theme/ThemeToggle"; // Add import

interface BottomNavMenuProps {
  user?: SupabaseUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  // onGoProClick?: () => void;
  onClose: () => void;
}

const BottomNavMenu = ({
  user,
  onLoginClick,
  onLogoutClick,
  // onGoProClick,
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

  const handleActionAndClose = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className={styles.menuContainer}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.menu}>
        <div className={styles.menuContent}>
          {user ? (
            <>
              <button className={styles.closeButton} onClick={onClose}>
                ×
              </button>
              <Link
                href="/profile"
                className={styles.menuItem}
                onClick={onClose}
              >
                {/* <span className={styles.menuIcon}>⦿</span> */}
                <span className={styles.menuLabel}>Profile</span>
              </Link>

              <Link href="/faq" className={styles.menuItem} onClick={onClose}>
                {/* <span className={styles.menuIcon}>❓</span> */}
                <span className={styles.menuLabel}>FAQ</span>
              </Link>

              {/* <button
                className={styles.menuItem}
                onClick={() => handleActionAndClose(onGoProClick!)}
              >
                 <span className={styles.menuIcon}>⭐</span> 
                <span className={styles.menuLabel}>Go Pro</span>
              </button> */}

              {/* Theme toggle button */}
              <div className={styles.themeToggleWrapper}>
                <span className={styles.themeLabel}>
                  Change theme <span style={{ marginLeft: 4 }}>→</span>
                </span>
                <ThemeToggle />
              </div>

              <div className={styles.menuDivider} />

              <button
                className={`${styles.menuItem} ${styles.logoutItem}`}
                onClick={() => handleActionAndClose(onLogoutClick!)}
              >
                <span className={styles.menuIcon}>🚪</span>
                <span className={styles.menuLabel}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button className={styles.closeButton} onClick={onClose}>
                ×
              </button>
              <button
                className={styles.menuItem}
                onClick={() => handleActionAndClose(onLoginClick!)}
              >
                {/* <span className={styles.menuIcon}>🔑</span> */}
                <span className={styles.menuLabel}>Login</span>
              </button>

              <Link href="/faq" className={styles.menuItem} onClick={onClose}>
                {/* <span className={styles.menuIcon}>❓</span> */}
                <span className={styles.menuLabel}>FAQ</span>
              </Link>

              {/* <button
                className={styles.menuItem}
                onClick={() => handleActionAndClose(onGoProClick!)}
              >
                <span className={styles.menuIcon}>⭐</span>
                <span className={styles.menuLabel}>Go Pro</span>
              </button> */}

              {/* Theme toggle button */}
              <div className={styles.themeToggleWrapper}>
                <span className={styles.themeLabel}>
                  Change theme <span style={{ marginLeft: 4 }}>→</span>
                </span>
                <ThemeToggle />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomNavMenu;
