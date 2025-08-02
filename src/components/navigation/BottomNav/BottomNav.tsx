"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SupabaseUser } from "@/lib/supabaseClient";
import BottomNavItem from "./BottomNavItem";
import BottomNavMenu from "./BottomNavMenu";
import styles from "./BottomNav.module.css";

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
  const pathname = usePathname();

  const handleMenuAction = (action: () => void) => {
    action();
    setShowMenu(false);
  };

  return (
    <>
      <nav className={styles.bottomNav}>
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
                href="/my-content"
                isActive={pathname?.startsWith("/my-content") ?? false}
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
