"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const { user } = useAuth();
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

  // Do NOT gate the page on auth `loading`. AuthSessionProvider starts with
  // loading=true and only flips it inside an effect, and effects never run on
  // the server — so gating here meant the SSR pass rendered a spinner instead
  // of the gallery, the photographer cards and the affiliate section, and none
  // of that reached the HTML Google receives. The content does not depend on
  // who is logged in; `user` is null until the session resolves and the
  // login-required callbacks already handle that case.
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
