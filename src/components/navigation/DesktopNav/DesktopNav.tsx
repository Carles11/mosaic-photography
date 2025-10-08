"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DesktopNavButton from "./DesktopNavButton";
import DesktopNavDropdown from "./DesktopNavDropdown";
import styles from "./DesktopNav.module.css";
import type { DesktopNavProps } from "@/types";

const DesktopNav = ({
  user,
  onLoginClick,
  onLogoutClick,
}: // onGoProClick,
DesktopNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      <DesktopNavButton user={user} isOpen={isOpen} onClick={handleToggle} />
      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <DesktopNavDropdown
            user={user}
            onLoginClick={handleLogin}
            onLogoutClick={() => handleMenuAction(onLogoutClick!)}
            // onGoProClick={() => handleMenuAction(onGoProClick!)}
            onClose={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default DesktopNav;
