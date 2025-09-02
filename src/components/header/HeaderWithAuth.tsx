"use client";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

import Header from "@/components/header/Header";

interface HeaderWithAuthProps {
  onGoProClick?: () => void;
}

export default function HeaderWithAuth({ onGoProClick }: HeaderWithAuthProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <Header
      isHome={isHome}
      user={user}
      onLogoutClick={logout}
      onGoProClick={onGoProClick}
    />
  );
}
