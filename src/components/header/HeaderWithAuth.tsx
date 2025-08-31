"use client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header/Header";

interface HeaderWithAuthProps {
  onGoProClick?: () => void;
}

export default function HeaderWithAuth({ onGoProClick }: HeaderWithAuthProps) {
  const { user, logout } = useAuth();
  return (
    <Header user={user} onLogoutClick={logout} onGoProClick={onGoProClick} />
  );
}
