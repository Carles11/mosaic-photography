import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing Supabase environment variables. Check your .env.local file.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Helper to generate a slug for the advertiser
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w-]+/g, "");

async function migrateAffiliateLinks() {
  console.log("Starting affiliate links migration...");

  const { data: photographers, error } = await supabase
    .from("photographers")
    .select("*")
    .not("store", "is", null);

  if (error) {
    console.error("Error fetching photographers:", error);
    process.exit(1);
  }

  for (const photographer of photographers) {
    const { author, store } = photographer;
    if (!Array.isArray(store)) continue;

    for (const storeJson of store) {
      let parsedItem;
      try {
        parsedItem = JSON.parse(storeJson);
      } catch (e) {
        console.error(
          `Failed to parse store JSON for author ${author}:`,
          storeJson,
        );
        continue;
      }

      const {
        store: storeName, // e.g., "Amazon"
        website, // e.g., "https://amzn.to/..."
        image, // e.g., product image URL
        item, // e.g., "book", "print"
        description, // e.g., "Discover Alfred..."
      } = parsedItem;

      // 1. Check if advertiser already exists
      let advertiserId;
      const { data: existingAdvertiser, error: advErr } = await supabase
        .from("affiliate_advertisers")
        .select("id")
        .eq("name", storeName)
        .maybeSingle();

      if (advErr) {
        console.error("Error checking advertiser:", advErr);
        continue;
      }

      // 2. Assign ID or create new advertiser
      if (existingAdvertiser) {
        advertiserId = existingAdvertiser.id;
      } else {
        const { data: newAdv, error: newAdvErr } = await supabase
          .from("affiliate_advertisers")
          .insert({
            name: storeName,
            slug: generateSlug(storeName),
            platform: storeName, // Defaulting platform to the store name
          })
          .select("id")
          .single();

        if (newAdvErr) {
          console.error(`Error inserting advertiser ${storeName}:`, newAdvErr);
          continue;
        }
        advertiserId = newAdv.id;
        console.log(`Created new advertiser: ${storeName}`);
      }

      // 3. Insert product linking back to the advertiser and photographer
      const { error: prodErr } = await supabase
        .from("affiliate_products")
        .insert({
          advertiser_id: advertiserId,
          type: item || "resource", // 'book', 'print', etc.
          title: { en: item }, // Saving as JSONB for multilingual
          description: { en: description },
          affiliate_url: website,
          image_url: image, // The product image
          photographer_author: author,
        });

      if (prodErr) {
        console.error(`Error inserting product for ${author}:`, prodErr);
      } else {
        console.log(`Successfully migrated product for ${author}`);
      }
    }
  }
  console.log("Migration complete!");
}

migrateAffiliateLinks().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
