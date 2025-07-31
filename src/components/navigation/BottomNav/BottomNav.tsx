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
            icon="⌂" // Alternative: house with garden
            label="Home"
            href="/"
            isActive={pathname === "/"}
          />
          {/* Other subtle home icon options:
              icon="⌂" // House symbol
              icon="🛖" // Hut
              icon="🗝️" // Key (symbolic for home)
              icon="🏠" // Original
          */}

          {user ? (
            <>
              <BottomNavItem
                icon="⦿" // Bust in silhouette (slight, classic)
                // Alternatives:
                // icon="👤" // Two people (group/profile)
                // icon="👥" // Two people (group/profile)
                // icon="🧑" // Slight person (current)
                // icon="🪪" // ID card (profile/identity)
                // icon="⚪" // Simple circle (minimal profile)
                // icon="◉" // Filled circle (minimal profile)
                // icon="⦿" // Circled dot (minimal profile)
                label="Profile"
                href="/profile"
                isActive={pathname === "/profile"}
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
              <BottomNavItem icon="🔑" label="Login" onClick={onLoginClick} />
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
