"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { RouteGuardProps } from "@/lib/auth/auth-guards";

export function PublicRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/",
}: RouteGuardProps) {
  const { loading } = useAuthGuard({
    required: false,
    redirectTo,
  });

  // const _shouldRender = /* ... */; // Unused but keeping for reference

  if (loading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
