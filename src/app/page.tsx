"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import { useAuth } from "@/hooks/useAuth";
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Handle URL parameters for backward compatibility (email redirects, etc.)
  useEffect(() => {
    if (!isInitialized && searchParams) {
      const modal = searchParams.get("modal");
      const type = searchParams.get("type");

      if (modal === "auth") {
        // For backward compatibility, show modal for email redirects
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
      // Clear URL parameters when modal is closed
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("modal");
        url.searchParams.delete("type");
        router.replace(url.pathname);
      }
    }
  }, [showAuthModal, router, isInitialized]);

  // Navigate to login page instead of opening modal
  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  const handleGoProClick = () => {
    sendGTMEvent({
      event: "goProText",
      value: "Go Pro clicked from bottom nav",
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HomeClientWrapper
        onLoginClick={handleLoginClick}
        onLogoutClick={logout}
        user={user}
        onGoProClick={handleGoProClick}
      />

      {/* Keep modal for backward compatibility with email redirects */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={authView}
        initialEmail=""
      />
    </>
  );
}
