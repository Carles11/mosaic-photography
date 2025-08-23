"use client";
import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthSession } from "@/context/AuthSessionContext";
import { useAuth } from "@/hooks/useAuth";
import GoProModal from "@/components/modals/goProModal/GoProModal";
import BottomNav from "@/components/navigation/BottomNav/BottomNav";

export default function GlobalNavProvider() {
  const { logout } = useAuth();
  const [showGoProModal, setShowGoProModal] = useState(false);

  const handleGoProClick = () => {
    setShowGoProModal(true);
  };

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <>
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
