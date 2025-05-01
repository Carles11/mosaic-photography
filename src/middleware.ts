import { NextRequest, NextResponse } from "next/server";

// Middleware to set a cookie for bots
export function middleware(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const isBot = /bot|crawl|slurp|spider|google/i.test(userAgent);

  const response = NextResponse.next();

  if (isBot) {
    response.cookies.set("skip_age_modal", "1", {
      path: "/",
    });
  } else {
    response.cookies.delete("skip_age_modal");
  }

  return response;
}

export const config = {
  matcher: ["/", "/ImageCard", "/AuthorCard"], // apply middleware only to specific routes
};
