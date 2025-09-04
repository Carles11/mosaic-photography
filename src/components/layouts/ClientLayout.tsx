"use client";
import React from "react";
import HeaderWithAuth from "@/components/header/HeaderWithAuth";
import Footer from "@/components/footer/Footer";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";
import { useModal } from "@/context/modalContext/useModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const { open } = useModal();

  const handleGoProClick = () => {
    open("goPro");
    sendGTMEvent({
      event: "goProText",
      value: "Go Pro clicked from user menu",
    });
  };
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

      {/* ModalProviderLoader is mounted in the root layout so useModal() is available here */}
    </>
  );
}
