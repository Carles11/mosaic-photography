/**
 * POST /api/indexnow
 *
 * Protected API route that triggers an IndexNow submission for one or more URLs.
 * Requires the `Authorization: Bearer <INDEXNOW_ADMIN_SECRET>` header.
 *
 * Body (JSON):
 *   { urls?: string[] }    – optional list of full URLs to submit
 *                            If omitted, submits all photographer pages + homepage.
 *
 * Environment variables required:
 *   INDEXNOW_KEY           – your IndexNow verification key
 *   INDEXNOW_ADMIN_SECRET  – a strong random secret to protect this endpoint
 */
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://www.mosaic.photography";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function POST(req: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────
  const adminSecret = process.env.INDEXNOW_ADMIN_SECRET;
  if (!adminSecret) {
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
    // empty body is fine – we will use all-photographer fallback
  }

  const urls: string[] =
    Array.isArray(body.urls) && body.urls.length > 0
      ? body.urls
      : [SITE_URL, `${SITE_URL}/faq`];

  // ── Submit ──────────────────────────────────────────────────────────────
  const payload = {
    host: "www.mosaic.photography",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (response.ok || response.status === 202) {
    return NextResponse.json({
      success: true,
      submitted: urls.length,
      status: response.status,
    });
  }

  const errBody = await response.text();
  return NextResponse.json(
    {
      error: "IndexNow rejected the submission.",
      detail: errBody,
      status: response.status,
    },
    { status: 502 },
  );
}
