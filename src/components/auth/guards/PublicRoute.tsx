"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { RouteGuardProps } from "@/lib/auth/auth-guards";

export function PublicRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/",
}: RouteGuardProps) {
  const { shouldRender, loading } = useAuthGuard({
    required: false,
    redirectTo,
  });

  if (loading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
