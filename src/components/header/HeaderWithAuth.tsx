"use client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header/Header";

export default function HeaderWithAuth() {
  const { user, logout } = useAuth();
  return <Header user={user} onLogoutClick={logout} />;
}
