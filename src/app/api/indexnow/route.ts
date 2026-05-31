/**
 * POST /api/indexnow
 *
 * Protected API route that triggers an IndexNow submission for one or more URLs.
 * Requires the `Authorization: Bearer <INDEXNOW_ADMIN_SECRET>` header.
 *
 * Body (JSON):
 *   { urls?: string[] }    – optional list of full URLs to submit
 *                            If omitted, submits all default important pages.
 *
 * Environment variables required:
 *   INDEXNOW_KEY           – your IndexNow verification key
 *   INDEXNOW_ADMIN_SECRET  – a strong random secret to protect this endpoint
 */
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://www.mosaic.photography";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

const DEFAULT_URLS = [
  SITE_URL,
  `${SITE_URL}/about`,
  `${SITE_URL}/faq`,
  `${SITE_URL}/photo-curations`,
  `${SITE_URL}/legal/privacy-policy`,
  `${SITE_URL}/legal/terms-of-service`,
];

export async function POST(req: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────
  const adminSecret = process.env.INDEXNOW_ADMIN_SECRET;
  if (!adminSecret) {
    console.error("INDEXNOW_ADMIN_SECRET is not configured");
    return NextResponse.json(
      { error: "INDEXNOW_ADMIN_SECRET is not configured on the server." },
      { status: 500 },
    );
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (token !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Key check ───────────────────────────────────────────────────────────
  const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
  if (!INDEXNOW_KEY) {
    console.error("INDEXNOW_KEY is not configured");
    return NextResponse.json(
      { error: "INDEXNOW_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: { urls?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine – use default URLs
  }

  const urls: string[] =
    Array.isArray(body.urls) && body.urls.length > 0 ? body.urls : DEFAULT_URLS;

  // Validate all URLs belong to this domain
  const validUrls = urls.filter((url) => url.startsWith(SITE_URL));

  if (validUrls.length === 0) {
    return NextResponse.json(
      { error: "No valid URLs provided. All URLs must start with " + SITE_URL },
      { status: 400 },
    );
  }

  if (validUrls.length !== urls.length) {
    console.warn(`Filtered out ${urls.length - validUrls.length} invalid URLs`);
  }

  // ── Submit to IndexNow ──────────────────────────────────────────────────
  const payload = {
    host: "www.mosaic.photography",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: validUrls,
  };

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (response.ok || response.status === 202) {
      console.log(`IndexNow: Successfully submitted ${validUrls.length} URLs`);
      return NextResponse.json({
        success: true,
        submitted: validUrls.length,
        status: response.status,
        urls: validUrls,
      });
    }

    const errBody = await response.text();
    console.error(`IndexNow error ${response.status}: ${errBody}`);

    return NextResponse.json(
      {
        error: "IndexNow rejected the submission.",
        detail: errBody,
        status: response.status,
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("IndexNow request failed:", error);
    return NextResponse.json(
      { error: "Failed to reach IndexNow API." },
      { status: 502 },
    );
  }
}
