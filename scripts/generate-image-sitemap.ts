import { config } from "dotenv";
config();
config({ path: ".env.local", override: true });
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Rows of `images_resize` as selected below.
type SitemapImage = {
  id: number;
  base_url: string;
  filename: string;
  title?: string;
  description?: string;
  author?: string;
  width?: number;
  height?: number;
  orientation?: string;
  color?: string;
  nudity?: string;
  exclude_from_index?: boolean;
};

async function generateImageSitemap() {
  // Fetch all resized images.
  // The Supabase REST API returns at most 1,000 rows per request, so page
  // through the table. A fixed order (.order("id")) is required: without one,
  // consecutive pages can overlap or skip rows.
  const imagesAll: SitemapImage[] = [];
  const PAGE_SIZE = 1000;
  let columnMissing = false;

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("images_resize")
      .select(
        "id, base_url, filename, title, description, author, width, height, orientation, color, nudity, exclude_from_index",
      )
      .order("id")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      // If column doesn't exist yet (migration not run), fall back to select without it
      const errMsg = String((error as any)?.message || error);
      if (errMsg.includes("exclude_from_index") || errMsg.includes("column")) {
        columnMissing = true;
        break;
      }
      console.error("Error fetching images_resize:", error);
      process.exit(1);
    }

    imagesAll.push(...((data as SitemapImage[]) ?? []));

    // A short page means the table is exhausted.
    if (!data || data.length < PAGE_SIZE) break;
  }

  let images: SitemapImage[] = [];
  if (columnMissing) {
    console.warn(
      "[image-sitemap] exclude_from_index column missing (migration not run) — continuing with all rows",
    );
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("images_resize")
        .select(
          "id, base_url, filename, title, description, author, width, height, orientation, color, nudity",
        )
        .order("id")
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching images_resize:", error);
        process.exit(1);
      }

      images.push(...((data as SitemapImage[]) ?? []));

      if (!data || data.length < PAGE_SIZE) break;
    }
  } else {
    images = imagesAll;
  }

  const excludedCount = columnMissing
    ? 0
    : imagesAll.filter((img) => img.exclude_from_index === true).length;

  if (!columnMissing) {
    images = imagesAll.filter((img) => img.exclude_from_index !== true);
  }

  console.log(`[image-sitemap] fetched ${imagesAll.length} images_resize rows`);
  if (!columnMissing) {
    console.log(`[image-sitemap] excluded ${excludedCount} rows with exclude_from_index=true`);
  }

  if (images.length === 0) {
    console.error("[image-sitemap] refusing to write: no images_resize rows");
    process.exit(1);
  }

  // Fetch all photographers
  const { data: photographers, error: photographerError } = await supabase
    .from("photographers")
    .select("name, surname, origin, slug");

  if (photographerError) {
    console.error("Error fetching photographers:", photographerError);
    process.exit(1);
  }

  if (!photographers || photographers.length === 0) {
    console.error("[image-sitemap] refusing to write: no photographers rows");
    process.exit(1);
  }

  // Create XML sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add homepage with featured images (first 10 images)
  sitemap += `  <url>
    <loc>https://www.mosaic.photography/</loc>
`;

  images.slice(0, 10).forEach((image) => {
    sitemap += makeImageXml(image, undefined);
  });

  sitemap += `  </url>
`;

  // Add photographer pages with their images
  const seenImageLocs = new Set<string>();
  let duplicatesSkipped = 0;
  photographers.forEach((photographer) => {
    const slug = photographer.slug;
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      console.warn(
        `[image-sitemap] skipping photographer with missing or non-ASCII slug: ${photographer.surname} -> ${slug}`,
      );
      return;
    }
    const photographerImages = images.filter(
      (img) =>
        img.author &&
        img.author.toLowerCase().includes(photographer.surname.toLowerCase()),
    );

    const uniqueImages = photographerImages.filter((image) => {
      const loc = imageLoc(image);
      if (seenImageLocs.has(loc)) {
        duplicatesSkipped += 1;
        return false;
      }
      seenImageLocs.add(loc);
      return true;
    });

    if (uniqueImages.length > 0) {
      sitemap += `  <url>
    <loc>https://www.mosaic.photography/photographers/${slug}</loc>
`;

      uniqueImages.forEach((image) => {
        sitemap += makeImageXml(image);
      });

      sitemap += `  </url>
`;
    }
  });

  // Close sitemap
  sitemap += `</urlset>`;

  console.log(`[image-sitemap] skipped ${duplicatesSkipped} duplicate image locs`);

  const imageImageCount = (sitemap.match(/<image:image>/g) || []).length;
  console.log(`[image-sitemap] writing ${imageImageCount} <image:image> entries`);

  // Write to file
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, "image-sitemap.xml"), sitemap);
  console.log("Image sitemap generated successfully!");
}

// Size buckets the resize pipeline actually generates (no upscaling —
// a bucket only exists when the original is at least that wide).
// Keep in sync with S3_SIZE_WIDTHS in src/utils/imageResizingS3.ts.
const S3_SIZE_WIDTHS = [400, 600, 800, 1200, 1600];

// Largest size bucket guaranteed to exist for an image of the given width.
// Falls back to originalsWEBP (always present) when width is unknown or
// smaller than every bucket.
function bestSizeFolder(width?: number): string {
  if (!width) return "originalsWEBP";
  const available = S3_SIZE_WIDTHS.filter((w) => w <= width);
  return available.length > 0
    ? `w${available[available.length - 1]}`
    : "originalsWEBP";
}

// Single source of truth for an image's <image:loc> value.
function imageLoc(image: {
  base_url: string;
  filename: string;
  width?: number;
}): string {
  // base_url already contains the full CDN base path; just append size bucket + filename
  const filenameWebp = image.filename.replace(/\.[^/.]+$/, ".webp");
  // A few filenames contain characters that must be percent-encoded to fetch:
  // spaces and non-ASCII ("gärtners") are invalid in a sitemap <loc>, and a
  // literal "+" is decoded as a space by the CDN, so the object 403s unless
  // sent as %2B. encodeURI leaves "+" alone, hence the extra replace.
  return encodeURI(
    `${image.base_url}/${bestSizeFolder(image.width)}/${filenameWebp}`,
  ).replace(/\+/g, "%2B");
}

// Helper function to create <image:image> block
function makeImageXml(
  image: {
    base_url: string;
    filename: string;
    title?: string;
    description?: string;
    author?: string;
    width?: number;
    height?: number;
    orientation?: string;
    color?: string;
    nudity?: string;
  },
  geo_location?: string,
) {
  const loc = imageLoc(image);
  return `    <image:image>
      <image:loc>${loc}</image:loc>
      <image:title>${escapeXml(
        image.title || "Vintage Photography",
      )}</image:title>
      <image:caption>${escapeXml(
        image.description || "Vintage nude photography from Mosaic Gallery",
      )}</image:caption>
      ${
        geo_location
          ? `<image:geo_location>${escapeXml(
              geo_location,
            )}</image:geo_location>`
          : ""
      }
      <image:license>https://creativecommons.org/publicdomain/mark/1.0/</image:license>
    </image:image>
`;
}

// XML escaping utility
function escapeXml(unsafe: string): string {
  return unsafe
    ? unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case "&":
            return "&amp;";
          case "'":
            return "&apos;";
          case '"':
            return "&quot;";
          default:
            return c;
        }
      })
    : "";
}

// Run the generator
generateImageSitemap().catch((err) => {
  console.error(err);
  process.exit(1);
});
