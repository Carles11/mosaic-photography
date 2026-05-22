"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/context/CommentsContext";
import HomeClientWrapper from "@/components/wrappers/HomeClientWrapper";
import { AuthView } from "@/types/auth";
import { Photographer } from "@/types/gallery";
import { ImageWithOrientation } from "@/types/gallery";
import { ResourcesSlider } from "@/components/sliders/ResourcesSlider";
import { AffiliateProductWithAdvertiser } from "@/utils/fetchAffiliateDataSSR";

// Import session debug for development
if (process.env.NODE_ENV === "development") {
  import("@/utils/sessionDebug");
}

interface HomeClientProps {
  photographers?: Photographer[];
  images?: ImageWithOrientation[];
  affiliateProducts?: AffiliateProductWithAdvertiser[];
}

export default function HomeClient({
  photographers,
  images,
  affiliateProducts,
}: HomeClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isInitialized, setIsInitialized] = useState(false);

  const { loadCommentCountsBatch } = useComments();

  const imageIds = useMemo(
    () => images?.map((img) => String(img.id)) ?? [],
    [images],
  );

  useEffect(() => {
    if (imageIds.length === 0) return;
    loadCommentCountsBatch(imageIds);
  }, [imageIds, loadCommentCountsBatch]);

  // Handle URL parameters for backward compatibility (email redirects, etc.)
  useEffect(() => {
    if (!isInitialized && searchParams) {
      const modal = searchParams.get("modal");
      const type = searchParams.get("type");

      if (modal === "auth") {
        setShowAuthModal(true);
        if (type === "password-reset") {
          setAuthView("password-reset");
        } else if (type === "verify-email") {
          setAuthView("verify-email");
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

  console.log("homecliente affiliateProducts", affiliateProducts);
  return (
    <>
      {affiliateProducts && affiliateProducts.length > 0 && (
        <section aria-label="Creative Essentials" style={{ marginBottom: 32 }}>
          <h2 style={{ textAlign: "center", marginBottom: 8, paddingTop: 32 }}>
            Mosaic Photography&apos;s Creative Essentials
          </h2>
          <ResourcesSlider products={affiliateProducts} />
        </section>
      )}

      <HomeClientWrapper
        photographers={photographers}
        images={images}
        user={user}
        onLoginClick={() => router.push("/auth/login")}
      />

      {/* NOTE: AuthModal is commented out for backward compatibility with email redirects.
        Uncomment and implement if required for your authentication flow.
      */}
      {/* <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView={authView}
        initialEmail=""
      /> */}
    </>
  );
}
