"use client";
import React, { useState } from "react";
import HeaderWithAuth from "@/components/header/HeaderWithAuth";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";
import GoProModal from "@/components/modals/goProModal/GoProModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const [showGoProModal, setShowGoProModal] = useState(false);

  const handleGoProClick = () => setShowGoProModal(true);
  const handleLoginClick = () => router.push("/auth/login");
  const handleLogoutClick = () => logout();

  return (
    <>
      <HeaderWithAuth
        onGoProClick={handleGoProClick}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />

      {/* Global mobile BottomNav (avoid duplicating per-page) */}
      <BottomNav
        onGoProClick={handleGoProClick}
        onLogoutClick={handleLogoutClick}
      />

      <GoProModal
        isOpen={showGoProModal}
        onClose={() => setShowGoProModal(false)}
      />
    </>
  );
}
