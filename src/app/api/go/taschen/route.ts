import { NextRequest, NextResponse } from "next/server";

/**
 * TASCHEN affiliate router.
 *
 * TASCHEN runs one Awin programme per country (US, UK, DE, FR, ES, IT). The
 * tracking links differ only in the `awinmid` (programme id); publisher id and
 * destination are the same. Instead of storing six links per book, products
 * store ONE url of the form
 *
 *   /api/go/taschen?u=https://www.taschen.com/en/books/photography/…
 *
 * and this route picks the programme for the visitor's country, then 302s to
 * the Awin tracking link. Unknown / other countries fall back to the US
 * programme (TASCHEN ships worldwide from taschen.com).
 *
 * Country comes from the CDN header when present (CloudFront on Amplify,
 * Vercel's equivalent for portability), else from Accept-Language, else US.
 *
 * Env: AWIN_PUBLISHER_ID (your Awin publisher/affiliate id — numeric).
 */

const PROGRAMMES: Record<string, string> = {
  US: "28585",
  GB: "28575",
  DE: "28577",
  FR: "28579",
  ES: "28581",
  IT: "28583",
};

// Neighbouring markets served by the closest programme.
const COUNTRY_ALIASES: Record<string, string> = {
  AT: "DE",
  CH: "DE",
  LI: "DE",
  BE: "FR",
  LU: "FR",
  MC: "FR",
  IE: "GB",
  PT: "ES",
  AD: "ES",
  SM: "IT",
  VA: "IT",
  CA: "US",
  MX: "US",
};

const LANG_TO_COUNTRY: Record<string, string> = {
  de: "DE",
  fr: "FR",
  es: "ES",
  it: "IT",
  "en-gb": "GB",
  en: "US",
};

function resolveCountry(req: NextRequest): string {
  const fromCdn =
    req.headers.get("cloudfront-viewer-country") ||
    req.headers.get("x-vercel-ip-country") ||
    "";
  const cdn = fromCdn.toUpperCase();
  if (cdn) return COUNTRY_ALIASES[cdn] || (PROGRAMMES[cdn] ? cdn : "US");

  const accept = (req.headers.get("accept-language") || "").toLowerCase();
  for (const part of accept.split(",")) {
    const tag = part.split(";")[0].trim();
    if (!tag) continue;
    if (LANG_TO_COUNTRY[tag]) return LANG_TO_COUNTRY[tag];
    const base = tag.split("-")[0];
    if (LANG_TO_COUNTRY[base]) return LANG_TO_COUNTRY[base];
  }
  return "US";
}

export function GET(req: NextRequest) {
  const publisherId = process.env.AWIN_PUBLISHER_ID;
  const target = req.nextUrl.searchParams.get("u") || "https://www.taschen.com/";

  // Only ever redirect to taschen.com — never act as an open redirect.
  let destination: URL;
  try {
    destination = new URL(target);
  } catch {
    return NextResponse.redirect("https://www.taschen.com/", 302);
  }
  if (!/^(www\.)?taschen\.com$/i.test(destination.hostname)) {
    return NextResponse.redirect("https://www.taschen.com/", 302);
  }

  // No publisher id configured: send people to the book anyway, untracked.
  if (!publisherId) {
    return NextResponse.redirect(destination.toString(), 302);
  }

  const country = resolveCountry(req);
  const awinmid = PROGRAMMES[country] || PROGRAMMES.US;
  const clickref = req.nextUrl.searchParams.get("ref") || "mosaic";

  const awin = new URL("https://www.awin1.com/cread.php");
  awin.searchParams.set("awinmid", awinmid);
  awin.searchParams.set("awinaffid", publisherId);
  awin.searchParams.set("clickref", clickref.slice(0, 64));
  awin.searchParams.set("ued", destination.toString());

  const res = NextResponse.redirect(awin.toString(), 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
