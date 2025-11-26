"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthSession } from "@/context/AuthSessionContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import BottomNavMenu from "./BottomNavMenu";
import styles from "./BottomNav.module.css";

const ICONS = {
  home: (
    <svg className={styles.tabIcon} viewBox="0 0 24 24">
      <path fill="currentColor" d="M3 12L12 4l9 8h-3v8h-4v-4H10v4H6v-8H3z" />
    </svg>
  ),
  gallery: (
    <svg className={styles.tabIcon} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM7 17l3-4 2.5 3.01 3.5-4.51L19 17z"
      />
    </svg>
  ),
  login: (
    <svg className={styles.tabIcon} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M10 17v-2H3V9h7V7l5 5-5 5zm4-9V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-2h-2v2H6V6h6v2h2z"
      />
    </svg>
  ),
  menu: (
    <svg className={styles.tabIcon} viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
};

interface BottomNavProps {
  onLogoutClick?: () => void;
}
const BottomNav = ({ onLogoutClick }: BottomNavProps) => {
  const { user } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const [showMenu, setShowMenu] = useState(false);

  // Scroll hide/show logic
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current + 8) {
            setVisible(false);
          } else if (currentScrollY < lastScrollY.current - 8) {
            setVisible(true);
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Action handlers
  const onLoginClick = () => router.push("/auth/login");
  const defaultLogout = () => router.push("/logout");

  const handleMenuAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  // Button definitions
  const navButtons = [
    {
      key: "home",
      icon: ICONS.home,
      label: "Home",
      onClick: () => router.push("/"),
      isActive: pathname === "/",
    },
    user
      ? {
          key: "gallery",
          icon: ICONS.gallery,
          label: "Curations",
          onClick: () => router.push("/photo-curations"),
          isActive: pathname?.startsWith("/photo-curations"),
        }
      : {
          key: "login",
          icon: ICONS.login,
          label: "Login",
          onClick: onLoginClick,
          isActive: pathname?.startsWith("/auth/login"),
        },
    {
      key: "menu",
      icon: ICONS.menu,
      label: "Menu",
      // Use an inline handler with debug
      onClick: () => {
        setShowMenu(true);
        console.log("BottomNav menu clicked"); // DEBUG
      },
      isActive: showMenu,
    },
  ];

  return (
    <>
      <nav
        className={
          styles.bottomNav +
          " " +
          (visible ? styles.bottomNavVisible : styles.bottomNavHidden)
        }
        aria-label="Bottom navigation"
      >
        <div className={styles.navContainer}>
          {navButtons.map((item) => (
            <button
              key={item.key}
              type="button"
              title={item.label}
              className={
                styles.tabItem +
                (item.isActive ? " " + styles.tabItemActive : "")
              }
              onClick={item.onClick}
              tabIndex={0}
              aria-current={item.isActive ? "page" : undefined}
            >
              <span className={styles.tabIconWrap}>{item.icon}</span>
              <span className={styles.tabLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MODAL */}
      {showMenu && (
        <>
          <div
            className={styles.menuBackdrop} // z-index: 401
            onClick={() => setShowMenu(false)}
            aria-label="Close menu"
          />
          <BottomNavMenu
            user={user}
            onLoginClick={() => handleMenuAction(onLoginClick)}
            onLogoutClick={() =>
              handleMenuAction(onLogoutClick || defaultLogout)
            }
            onClose={() => setShowMenu(false)}
          />
        </>
      )}
    </>
  );
};

export default BottomNav;
