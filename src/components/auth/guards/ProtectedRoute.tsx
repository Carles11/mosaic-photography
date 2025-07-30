"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { RouteGuardProps } from "@/lib/auth/auth-guards";

export function ProtectedRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo,
}: RouteGuardProps) {
  const { shouldRender, loading } = useAuthGuard({
    required: true,
    redirectTo,
  });

  if (loading) {
    return <>{fallback}</>;
  }

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
