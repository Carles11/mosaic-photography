/**
 * IndexNow submission script
 *
 * Submits all photographer pages, toolkit pages, and static pages to the
 * IndexNow API so Bing and any other participating search engine index them
 * immediately after a build that introduces new or updated pages.
 *
 * Docs: https://www.indexnow.org/documentation
 *
 * Prerequisites:
 *   1. Set INDEXNOW_KEY in your environment (Amplify env vars / .env.local).
 *   2. Place a file at  public/{INDEXNOW_KEY}.txt  containing only the key value.
 *      Run  yarn gen:indexnow-keyfile  to create it automatically.
 *   3. This script is called automatically by the postbuild hook.
 *      Skip the API call locally: it only runs when NODE_ENV=production.
 */
import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SITE_URL = "https://www.mosaic.photography";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? "";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

const STATIC_URLS = [
  SITE_URL,
  `${SITE_URL}/about`,
  `${SITE_URL}/faq`,
  `${SITE_URL}/photo-curations`,
  `${SITE_URL}/legal/privacy-policy`,
  `${SITE_URL}/legal/terms-of-service`,
  `${SITE_URL}/legal/credits`,
];

async function submitIndexNow() {
  if (!INDEXNOW_KEY) {
    console.warn(
      "[IndexNow] INDEXNOW_KEY not set – skipping submission. Set it in .env.local or Amplify env vars.",
    );
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[IndexNow] NODE_ENV is not 'production' – skipping submission.",
    );
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  let photographerUrls: string[] = [];
  let toolkitUrls: string[] = [];

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "[IndexNow] Missing Supabase env vars – submitting static URLs only.",
    );
  } else {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Photographers ────────────────────────────────────────────
    const { data: photographers, error: photographersError } = await supabase
      .from("photographers")
      .select("surname");

    if (photographersError) {
      console.warn(
        "[IndexNow] Error fetching photographers – skipping photographer URLs:",
        photographersError.message,
      );
    } else {
      photographerUrls = (photographers ?? []).map((p) => {
        const slug = p.surname.toLowerCase().replace(/\s+/g, "-");
        return `${SITE_URL}/photographers/${slug}`;
      });
    }

    // ── Toolkit / Advertisers ────────────────────────────────────
    const { data: advertisers, error: advertisersError } = await supabase
      .from("affiliate_advertisers")
      .select("slug");

    if (advertisersError) {
      console.warn(
        "[IndexNow] Error fetching advertisers – skipping toolkit URLs:",
        advertisersError.message,
      );
    } else {
      toolkitUrls = (advertisers ?? []).map(
        (a) => `${SITE_URL}/toolkit/${a.slug}`,
      );
    }
  }

  // ── Full URL list ────────────────────────────────────────────
  const urls = [...STATIC_URLS, ...photographerUrls, ...toolkitUrls];

  const payload = {
    host: "www.mosaic.photography",
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  console.log(
    `[IndexNow] Submitting ${urls.length} URLs (${STATIC_URLS.length} static, ${photographerUrls.length} photographers, ${toolkitUrls.length} toolkit)…`,
  );

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (response.ok || response.status === 202) {
    console.log(
      `[IndexNow] Accepted (HTTP ${response.status}) – ${urls.length} URLs queued.`,
    );
  } else {
    const body = await response.text();
    console.error(
      `[IndexNow] Submission failed (HTTP ${response.status}): ${body}`,
    );
  }
}

/**
 * Writes the IndexNow key verification file to public/{key}.txt.
 * Run manually once: tsx scripts/indexnow.ts --gen-keyfile
 */
function generateKeyFile() {
  if (!INDEXNOW_KEY) {
    console.error(
      "[IndexNow] INDEXNOW_KEY not set – cannot generate key file.",
    );
    process.exit(1);
  }
  const keyFilePath = path.join(process.cwd(), "public", `${INDEXNOW_KEY}.txt`);
  fs.writeFileSync(keyFilePath, INDEXNOW_KEY, "utf-8");
  console.log(`[IndexNow] Key file written: public/${INDEXNOW_KEY}.txt`);
}

const args = process.argv.slice(2);
if (args.includes("--gen-keyfile")) {
  generateKeyFile();
} else {
  submitIndexNow().catch(console.error);
}
