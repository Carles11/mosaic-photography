"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClimbBoxLoaderContainer } from "@/components/loaders/ClimbBoxLoader";
import { useAuth } from "@/hooks/useAuth";
import { useComments } from "@/context/CommentsContext";
import HomeClientWrapper from "@/components/wrappers/HomeClientWrapper";
import { Photographer } from "@/types/gallery";
import { ImageWithOrientation } from "@/types/gallery";
import { AffiliateProductWithAdvertiser } from "@/utils/fetchAffiliateDataSSR";
import { ContributorWithFeatured } from "@/utils/fetchContributorsWithFeaturedSSR";

// Import session debug for development
if (process.env.NODE_ENV === "development") {
  import("@/utils/sessionDebug");
}

interface HomeClientProps {
  photographers?: Photographer[];
  images?: ImageWithOrientation[];
  affiliateProducts?: AffiliateProductWithAdvertiser[];
  contributors?: ContributorWithFeatured[];
}

export default function HomeClient({
  photographers,
  images,
  affiliateProducts,
  contributors,
}: HomeClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
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
      if (modal === "auth") {
        setShowAuthModal(true);
      }
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // Clear URL parameters when modal is closed
  useEffect(() => {
    if (isInitialized && !showAuthModal) {
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

  return (
    <HomeClientWrapper
      photographers={photographers}
      images={images}
      affiliateProducts={affiliateProducts}
      contributors={contributors}
      user={user}
      onLoginClick={() => router.push("/auth/login")}
    />
  );
}
