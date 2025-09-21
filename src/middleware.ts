import { NextRequest, NextResponse } from "next/server";
import {
  isProtectedRoute,
  isAuthRoute,
  getAuthenticatedRedirect,
} from "@/lib/auth/auth-guards";

// Middleware to handle bot cookies and auth protection
export async function middleware(req: NextRequest) {
  // Skip middleware during build time
  if (
    process.env.NODE_ENV === undefined ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    return NextResponse.next();
  }

  const userAgent = req.headers.get("user-agent") || "";
  const isBot = /bot|crawl|slurp|spider|google/i.test(userAgent);
  const { pathname, searchParams } = req.nextUrl;

  // Create response
  const response = NextResponse.next();

  // Detect theme cookie and set x-theme header
  const themeCookie = req.cookies.get("theme")?.value;
  if (themeCookie === "dark" || themeCookie === "light") {
    response.headers.set("x-theme", themeCookie);
  }

  // Handle bot cookie logic
  if (isBot) {
    response.cookies.set("skip_age_modal", "1", {
      path: "/",
    });
  } else {
    response.cookies.delete("skip_age_modal");
  }

  // Skip auth checks for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return response;
  }

  // Skip auth checks for non-protected routes to avoid unnecessary redirects
  if (!isProtectedRoute(pathname)) {
    return response;
  }

  // Get auth token from cookies - Edge Runtime compatible approach
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in middleware");
    // During build time or when env vars are missing, skip auth checks
    return response;
  }

  try {
    // Simple authentication check using access token from cookies
    // This avoids using the full Supabase client which has Node.js dependencies
    let isAuthenticated = false;

    // Check for Supabase auth cookies
    const accessTokenCookie = req.cookies.get("sb-access-token");
    const refreshTokenCookie = req.cookies.get("sb-refresh-token");

    // Simple check - if we have auth cookies, assume authenticated
    // The actual auth validation will happen on the client side
    if (accessTokenCookie?.value && refreshTokenCookie?.value) {
      isAuthenticated = true;
    }

    // Temporarily disable auth checks in middleware - let client-side handle it
    // This ensures we don't block users due to Edge Runtime limitations
    // The ProtectedRoute component will handle proper authentication

    // Handle auth routes for potentially authenticated users
    if (isAuthRoute(pathname) && isAuthenticated) {
      const redirectTo = searchParams.get("redirect");
      const homeUrl = new URL(
        getAuthenticatedRedirect(redirectTo || undefined),
        req.url
      );
      return NextResponse.redirect(homeUrl);
    }
  } catch (error) {
    console.error("Middleware auth check error:", error);
    // Continue without auth check if there's an error
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
