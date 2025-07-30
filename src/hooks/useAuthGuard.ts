"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { getLoginRedirect } from "@/lib/auth/auth-guards";

export function useAuthGuard(
  options: {
    required?: boolean;
    redirectTo?: string;
  } = {},
) {
  const { required = true, redirectTo } = options;
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (required && !isAuthenticated) {
        // Redirect to login if authentication is required
        const redirect =
          redirectTo || getLoginRedirect(window.location.pathname);
        router.push(redirect);
      } else if (!required && isAuthenticated && redirectTo) {
        // Redirect authenticated users away from auth pages
        router.push(redirectTo);
      }
    }
  }, [user, loading, isAuthenticated, required, redirectTo, router]);

  return {
    user,
    loading,
    isAuthenticated,
    shouldRender: !loading && (required ? isAuthenticated : true),
  };
}
