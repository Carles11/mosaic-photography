"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import HomeClientWrapper from "@/components/wrappers/HomeClientWrapper";
import AuthModal from "@/components/auth/AuthModal";
import { AuthView } from "@/lib/auth/auth-types";

// Import session debug for development
if (process.env.NODE_ENV === "development") {
  import("@/utils/sessionDebug");
}

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle URL parameters on initial load
  useEffect(() => {
    if (!isInitialized && searchParams) {
      const modal = searchParams.get("modal");
      const type = searchParams.get("type");

      if (modal === "auth") {
        setShowAuthModal(true);
        if (type === "reset-password") {
          setAuthView("reset-password");
        } else if (type === "confirm-email") {
          setAuthView("confirm-email");
        } else {
          setAuthView("login");
        }
      }
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // Handle modal closing
  useEffect(() => {
    if (isInitialized && !showAuthModal) {
      setAuthView("login");
      setUserEmail("");
      // Clear URL parameters when modal is closed
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("modal");
        url.searchParams.delete("type");
        router.replace(url.pathname);
      }
    }
  }, [showAuthModal, router, isInitialized]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HomeClientWrapper
        showLoginButton={!user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={logout}
        user={user}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={authView}
        initialEmail={userEmail}
      />
    </>
  );
}
