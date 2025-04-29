import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const isBot = /bot|crawl|slurp|spider|google/i.test(userAgent);

  const response = NextResponse.next();

  if (isBot) {
    response.cookies.set("skip_age_modal", "1", {
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: "/(.*)", // Simplified matcher to apply middleware to all routes
};
