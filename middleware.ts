import { NextRequest, NextResponse } from "next/server";

console.log("Middleware is loaded");
// This log will confirm if the middleware is loaded
// and running on the server

export function middleware(req: NextRequest) {
  console.log("Middleware is running"); // Add this log to confirm execution

  const userAgent = req.headers.get("user-agent") || "";
  const isBot = /bot|crawl|slurp|spider|google/i.test(userAgent);

  console.log({ userAgent, isBot });
  const response = NextResponse.next();

  if (isBot) {
    response.cookies.set("skip_age_modal", "1", {
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/"], // Apply middleware only to the root route
};
