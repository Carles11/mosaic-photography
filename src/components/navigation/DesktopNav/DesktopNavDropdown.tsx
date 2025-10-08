"use client";

import Link from "next/link";
import styles from "./DesktopNav.module.css";
import ThemeToggle from "@/components/theme/ThemeToggle";
import type { DesktopNavDropdownProps } from "@/types";

const DesktopNavDropdown = ({
  user,
  onLoginClick,
  onLogoutClick,
  // onGoProClick,
  onClose,
}: DesktopNavDropdownProps) => {
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
            <span className={styles.menuLabel}>Profile</span>
          </Link>

          <Link
            href="/photo-curations"
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={onClose}
          >
            <span className={styles.menuLabel}>My Content</span>
          </Link>

          <Link
            href="/faq"
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={onClose}
          >
            <span className={styles.menuLabel}>FAQ</span>
          </Link>

          {/* <button
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={() => handleActionAndClose(onGoProClick!)}
          >
            <span className={styles.menuLabel}>Go Pro</span>
          </button> */}

          <div className={styles.themeToggleWrapper}>
            <span className={styles.themeLabel}>
              Change theme <span style={{ marginLeft: 4 }}>→</span>
            </span>{" "}
            <ThemeToggle />
          </div>

          <div className={styles.menuDivider} />

          <button
            className={`no-fancy-link ${styles.menuItem} ${styles.logoutItem}`}
            onClick={() => handleActionAndClose(onLogoutClick!)}
          >
            <span className={styles.menuLabel}>Logout</span>
          </button>
        </>
      ) : (
        <>
          <button
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={() => handleActionAndClose(onLoginClick!)}
          >
            <span className={styles.menuLabel}>Login</span>
          </button>

          <Link
            href="/faq"
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={onClose}
          >
            <span className={styles.menuLabel}>FAQ</span>
          </Link>

          {/* <button
            className={`no-fancy-link ${styles.menuItem}`}
            onClick={() => handleActionAndClose(onGoProClick!)}
          >
            <span className={styles.menuLabel}>Go Pro</span>
          </button> */}
          <div className={styles.themeToggleWrapper}>
            <span className={styles.themeLabel}>
              Change theme <span style={{ marginLeft: 4 }}>→</span>
            </span>{" "}
            <ThemeToggle />
          </div>
        </>
      )}
    </div>
  );
};

export default DesktopNavDropdown;
