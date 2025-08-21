/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  "/profile",
  "/profile/*",
  "/photo-curations",
] as const;

/**
 * Auth routes that should redirect authenticated users
 */
export const AUTH_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
] as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = ["/", "/auth/*", "/faq", "/legal"] as const;

/**
 * Check if a path matches any pattern in the given routes array
 */
function matchesRoute(path: string, routes: readonly string[]): boolean {
  return routes.some((route) => {
    if (route.endsWith("/*")) {
      const baseRoute = route.slice(0, -2);
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
}

/**
 * Check if route requires authentication
 */
export function isProtectedRoute(path: string): boolean {
  return matchesRoute(path, PROTECTED_ROUTES);
}

/**
 * Check if route is an auth route
 */
export function isAuthRoute(path: string): boolean {
  return matchesRoute(path, AUTH_ROUTES);
}

/**
 * Check if route is public
 */
export function isPublicRoute(path: string): boolean {
  return matchesRoute(path, PUBLIC_ROUTES);
}

/**
 * Get redirect URL for unauthenticated users
 */
export function getLoginRedirect(currentPath: string): string {
  const encodedPath = encodeURIComponent(currentPath);
  return `/auth/login?redirect=${encodedPath}`;
}

/**
 * Get redirect URL for authenticated users on auth pages
 */
export function getAuthenticatedRedirect(redirectParam?: string): string {
  if (redirectParam) {
    try {
      const decodedPath = decodeURIComponent(redirectParam);
      // Validate redirect path is safe
      if (decodedPath.startsWith("/") && !decodedPath.startsWith("//")) {
        return decodedPath;
      }
    } catch {
      // Invalid redirect param, fall back to default
    }
  }
  return "/";
}

/**
 * Route guard types for client-side components
 */
export type RouteGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
};

/**
 * Auth guard configuration
 */
export type AuthGuardConfig = {
  required: boolean;
  redirectTo: string;
  loadingComponent?: React.ComponentType;
};
