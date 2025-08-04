"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserMenuButton from "./UserMenuButton";
import UserMenuDropdown from "./UserMenuDropdown";
import styles from "./UserMenu.module.css";
import { SupabaseUser } from "@/lib/supabaseClient";

interface UserMenuProps {
  user?: SupabaseUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onGoProClick?: () => void;
}

const UserMenu = ({
  user,
  onLoginClick,
  onLogoutClick,
  onGoProClick,
}: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // Add this line

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuAction = (action: (() => void) | undefined) => {
    if (typeof action === "function") {
      action();
    }
    setIsOpen(false);
  };

  // Provide a fallback login handler
  const handleLogin = () => {
    if (onLoginClick) {
      handleMenuAction(onLoginClick);
    } else {
      router.push("/auth/login");
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.userMenu} ref={menuRef}>
      {/* Add the theme toggle icon here */}
      <UserMenuButton user={user} isOpen={isOpen} onClick={handleToggle} />

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <UserMenuDropdown
            user={user}
            onLoginClick={handleLogin}
            onLogoutClick={() => handleMenuAction(onLogoutClick!)}
            onGoProClick={() => handleMenuAction(onGoProClick!)}
            onClose={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default UserMenu;
