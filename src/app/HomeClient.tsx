"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import GoProModal from "@/components/modals/goProModal/GoProModal";
import { sendGTMEvent } from "@next/third-parties/google";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/context/CommentsContext";

import HomeClientWrapper from "@/components/wrappers/HomeClientWrapper";
import AuthModal from "@/components/auth/AuthModal";
import { AuthView } from "@/types/auth";

// Import session debug for development
if (process.env.NODE_ENV === "development") {
  import("@/utils/sessionDebug");
}

import { Photographer } from "@/types/gallery";

import { ImageWithOrientation } from "@/types/gallery";

interface HomeClientProps {
  photographers?: Photographer[];
  images?: ImageWithOrientation[];
}

export default function HomeClient({ photographers, images }: HomeClientProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGoProModal, setShowGoProModal] = useState(false);
  const { loadCommentCountsBatch } = useComments();

  useEffect(() => {
    if (!images || images.length === 0) return;
    const imageIds = images.map((img) => String(img.id));
    loadCommentCountsBatch(imageIds);
  }, [images, loadCommentCountsBatch]);

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
        const hadParams =
          url.searchParams.has("modal") || url.searchParams.has("type");
        url.searchParams.delete("modal");
        url.searchParams.delete("type");
        if (hadParams) {
          router.replace(url.pathname);
        }
      }
    }
  }, [showAuthModal, router, isInitialized]);

  // Navigate to login page instead of opening modal
  const handleLoginClick = () => {
    router.push("/auth/login");
  };

  const handleGoProClick = () => {
    setShowGoProModal(true);
    sendGTMEvent({
      event: "goProText",
      value: "Go Pro clicked from user menu",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ClimbBoxLoaderContainer("var(--text-color)", 22, true)}
      </div>
    );
  }

  return (
    <>
      <HomeClientWrapper
        photographers={photographers}
        images={images}
        onLoginClick={handleLoginClick}
        onLogoutClick={logout}
        user={user}
        onGoProClick={handleGoProClick}
      />

      {/* Go Pro Modal for both desktop and mobile */}
      <GoProModal
        isOpen={showGoProModal}
        onClose={() => setShowGoProModal(false)}
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
