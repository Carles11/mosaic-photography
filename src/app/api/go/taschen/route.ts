import { NextRequest, NextResponse } from "next/server";

/**
 * TASCHEN affiliate router.
 *
 * TASCHEN runs one Awin programme per region (US, UK, DE, FR, ES, IT) over a
 * SINGLE storefront, www.taschen.com, whose language is a path prefix:
 *
 *   https://www.taschen.com/en/books/photography/45409/alfred-stieglitz-camera-work/
 *   https://www.taschen.com/de/books/photography/45409/alfred-stieglitz-camera-work/
 *
 * Same numeric id, same English slug — only the first segment changes. There is
 * no /en-gb/ store; UK visitors use /en/.
 *
 * So products store ONE canonical English url:
 *
 *   /api/go/taschen?u=https://www.taschen.com/en/books/photography/45409/...&ref=stieglitz
 *
 * and this route does two things with the visitor's country:
 *
 *   1. picks the Awin programme id (`awinmid`) that should be credited, and
 *   2. rewrites the taschen.com language segment to a language that visitor
 *      actually reads.
 *
 * Those are deliberately SEPARATE decisions — see COUNTRY_MAP. A Dutch visitor
 * is credited to the German programme (nearest euro/EU-shipping region) but is
 * sent to the English page, because Dutch is not German. Mosaic itself stays
 * English-only; this is only about which page of TASCHEN's own store we hand
 * the visitor to.
 *
 * Country comes from the CDN header when present, else Accept-Language, else US.
 * Note: Amplify's managed CloudFront does not forward CloudFront-Viewer-Country
 * to the origin unless it is added to the cache/origin-request policy, so in
 * production the Accept-Language path is likely the one doing the work.
 *
 * Env: AWIN_PUBLISHER_ID (numeric Awin publisher id). Without it the visitor
 * still reaches the book, untracked.
 */

export const dynamic = "force-dynamic";

type Route = { mid: string; locale: string };

/** Awin programme ids for the six TASCHEN regional programmes. */
const MID = {
  US: "28585",
  GB: "28575",
  DE: "28577",
  FR: "28579",
  ES: "28581",
  IT: "28583",
} as const;

/** Language path segments that exist on taschen.com. */
const LOCALES = new Set(["en", "de", "fr", "es", "it"]);

/**
 * country -> { programme credited, taschen.com language segment }
 *
 * Rule of thumb: `mid` is the nearest programme that will actually pay for that
 * order; `locale` is a language the visitor reads. They match for the six home
 * markets and deliberately diverge for neighbours with no programme of their
 * own (NL, PT, BE-nl...) where the money is regional but the language is not.
 */
const COUNTRY_MAP: Record<string, Route> = {
  // Home markets.
  US: { mid: MID.US, locale: "en" },
  GB: { mid: MID.GB, locale: "en" },
  DE: { mid: MID.DE, locale: "de" },
  FR: { mid: MID.FR, locale: "fr" },
  ES: { mid: MID.ES, locale: "es" },
  IT: { mid: MID.IT, locale: "it" },

  // German-speaking neighbours.
  AT: { mid: MID.DE, locale: "de" },
  CH: { mid: MID.DE, locale: "de" },
  LI: { mid: MID.DE, locale: "de" },

  // French-speaking neighbours.
  BE: { mid: MID.FR, locale: "fr" },
  LU: { mid: MID.FR, locale: "fr" },
  MC: { mid: MID.FR, locale: "fr" },

  // Italian-speaking neighbours.
  SM: { mid: MID.IT, locale: "it" },
  VA: { mid: MID.IT, locale: "it" },

  // Spanish-speaking neighbour.
  AD: { mid: MID.ES, locale: "es" },

  // English-speaking / English-served markets on a European programme.
  IE: { mid: MID.GB, locale: "en" },
  NL: { mid: MID.DE, locale: "en" }, // euro + EU shipping, but Dutch != German
  PT: { mid: MID.ES, locale: "en" }, // Iberian shipping, but Portuguese != Spanish

  // Served by the international (US) programme.
  CA: { mid: MID.US, locale: "en" },
  MX: { mid: MID.US, locale: "en" },
  AU: { mid: MID.US, locale: "en" },
  NZ: { mid: MID.US, locale: "en" },
};

const FALLBACK: Route = { mid: MID.US, locale: "en" };

/** Accept-Language tag -> country key in COUNTRY_MAP. */
const LANG_TO_COUNTRY: Record<string, string> = {
  "en-gb": "GB",
  "en-ie": "IE",
  "en-au": "AU",
  "en-nz": "NZ",
  "en-ca": "CA",
  de: "DE",
  fr: "FR",
  es: "ES",
  it: "IT",
  nl: "NL",
  pt: "PT",
  en: "US",
};

function resolveRoute(req: NextRequest): Route {
  const cdn = (
    req.headers.get("cloudfront-viewer-country") ||
    req.headers.get("x-vercel-ip-country") ||
    ""
  ).toUpperCase();
  if (cdn) return COUNTRY_MAP[cdn] || FALLBACK;

  const accept = (req.headers.get("accept-language") || "").toLowerCase();
  for (const part of accept.split(",")) {
    const tag = part.split(";")[0].trim();
    if (!tag) continue;
    const exact = LANG_TO_COUNTRY[tag];
    if (exact) return COUNTRY_MAP[exact] || FALLBACK;
    const base = LANG_TO_COUNTRY[tag.split("-")[0]];
    if (base) return COUNTRY_MAP[base] || FALLBACK;
  }
  return FALLBACK;
}

/**
 * Replace (or insert) the language segment of a taschen.com URL.
 * /en/books/... -> /de/books/...   and   / -> /de/
 */
function withLocale(url: URL, locale: string): URL {
  const out = new URL(url.toString());
  const hadTrailingSlash = out.pathname.endsWith("/");
  const segments = out.pathname.split("/").filter(Boolean);

  if (segments.length > 0 && LOCALES.has(segments[0].toLowerCase())) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  out.pathname = "/" + segments.join("/") + (hadTrailingSlash ? "/" : "");
  return out;
}

export function GET(req: NextRequest) {
  const publisherId = process.env.AWIN_PUBLISHER_ID;
  const target =
    req.nextUrl.searchParams.get("u") || "https://www.taschen.com/en/";

  // Only ever redirect to taschen.com — never act as an open redirect.
  let destination: URL;
  try {
    destination = new URL(target);
  } catch {
    return NextResponse.redirect("https://www.taschen.com/en/", 302);
  }
  if (
    destination.protocol !== "https:" ||
    !/^(www\.)?taschen\.com$/i.test(destination.hostname)
  ) {
    return NextResponse.redirect("https://www.taschen.com/en/", 302);
  }

  const route = resolveRoute(req);
  const localised = withLocale(destination, route.locale);

  // No publisher id configured: send people to the book anyway, untracked.
  // Loud, because this failure is invisible from the outside — the visitor
  // still reaches the right page, the money just never arrives. See the
  // .env.production line in amplify.yml.
  if (!publisherId) {
    console.error(
      "[api/go/taschen] AWIN_PUBLISHER_ID is not set at runtime — redirecting untracked.",
    );
    const plain = NextResponse.redirect(localised.toString(), 302);
    plain.headers.set("Cache-Control", "no-store");
    plain.headers.set("X-Robots-Tag", "noindex, nofollow");
    return plain;
  }

  const clickref = req.nextUrl.searchParams.get("ref") || "mosaic";

  const awin = new URL("https://www.awin1.com/cread.php");
  awin.searchParams.set("awinmid", route.mid);
  awin.searchParams.set("awinaffid", publisherId);
  awin.searchParams.set("clickref", clickref.slice(0, 64));
  awin.searchParams.set("ued", localised.toString());

  const res = NextResponse.redirect(awin.toString(), 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
