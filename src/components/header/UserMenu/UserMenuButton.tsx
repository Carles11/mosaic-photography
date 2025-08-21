"use client";
import { sendGTMEvent } from "@next/third-parties/google";
import styles from "./UserMenu.module.css";
import type { UserMenuButtonProps } from "@/types";

const UserMenuButton = ({ user, isOpen, onClick }: UserMenuButtonProps) => {
  const getUserInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <button
      className={`${styles.menuButton} ${isOpen ? styles.menuButtonOpen : ""}`}
      onClick={() => {
        if (!user) {
          sendGTMEvent({
            event: "Desktop-Menu-Click",
            value: "Desktop-UserMenuButton",
          });
        }
        onClick();
      }}
      aria-expanded={isOpen}
      aria-haspopup="true"
      aria-label={user ? `User menu for ${user.email}` : "Login menu"}
    >
      {user ? (
        <div className={styles.userAvatar}>
          <span className={styles.userInitial}>
            {getUserInitial(user.email ?? "")}
          </span>
        </div>
      ) : (
        <span className={styles.menuLabel}>Menu</span>
      )}

      <svg
        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
      >
        <path
          d="M2 4l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default UserMenuButton;
