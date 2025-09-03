"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

import Header from "@/components/header/Header";

interface HeaderWithAuthProps {
  onGoProClick?: () => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export default function HeaderWithAuth({
  onGoProClick,
  onLoginClick,
  onLogoutClick,
}: HeaderWithAuthProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <Header
      isHome={isHome}
      user={user}
      onLogoutClick={onLogoutClick || logout}
      onLoginClick={onLoginClick}
      onGoProClick={onGoProClick}
    />
  );
}
