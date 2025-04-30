import { NextRequest, NextResponse } from "next/server";

console.log("middleware.js is being used!");
// Middleware to set a cookie for bots
// This middleware checks the user agent of incoming requests
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
  matcher: ["/", "/ImageCard", "/AuthorCard"], // apply middleware only to specific routes
};
