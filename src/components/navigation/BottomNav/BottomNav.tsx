"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import BottomNavItem from "./BottomNavItem";
import BottomNavMenu from "./BottomNavMenu";
import styles from "./BottomNav.module.css";
import { SupabaseUser } from "@/lib/supabaseClient";

interface BottomNavProps {
  user?: SupabaseUser | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onGoProClick?: () => void;
}

const BottomNav = ({
  user,
  onLoginClick,
  onLogoutClick,
  onGoProClick,
}: BottomNavProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const pathname = usePathname();

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

  const handleMenuAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <>
      <nav
        className={
          styles.bottomNav + (visible ? "" : " " + styles.bottomNavHidden)
        }
      >
        <div className={styles.navContainer}>
          <BottomNavItem
            icon="⌂"
            label="Home"
            href="/"
            isActive={pathname === "/"}
          />

          {user ? (
            <>
              <BottomNavItem
                icon="≡"
                label="Content"
                href="/photo-curations"
                isActive={pathname?.startsWith("/photo-curations") ?? false}
              />
              <BottomNavItem
                icon="⋯"
                label="Menu"
                onClick={() => setShowMenu(true)}
                isActive={showMenu}
              />
            </>
          ) : (
            <>
              <BottomNavItem icon="☰" label="Login" onClick={onLoginClick} />
              <BottomNavItem
                icon="⋯"
                label="Menu"
                onClick={() => setShowMenu(true)}
                isActive={showMenu}
              />
            </>
          )}
        </div>
      </nav>

      {showMenu && (
        <BottomNavMenu
          user={user}
          onLoginClick={() => handleMenuAction(onLoginClick!)}
          onLogoutClick={() => handleMenuAction(onLogoutClick!)}
          onGoProClick={() => handleMenuAction(onGoProClick!)}
          onClose={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

export default BottomNav;
