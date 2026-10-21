import { supabase } from "@/lib/supabaseClient";

export type PhotographerImageCounts = Record<
  string,
  { total: number; nude: number }
>;

/**
 * Image counts per photographer, keyed by the `author` column.
 *
 * Counts are fetched with head requests per author instead of selecting the
 * image rows: `images_resize` holds more than 1,000 rows and Supabase caps a
 * query at 1,000, so a single "select everything" count would be wrong.
 *
 * Portraits (`000_aaa*`) are excluded: they are a card/thumbnail asset, not
 * part of the photographed work.
 */
export async function fetchPhotographerImageCountsSSR(
  authors: string[],
): Promise<PhotographerImageCounts> {
  const counts: PhotographerImageCounts = {};
  if (!authors.length) return counts;

  await Promise.all(
    authors.map(async (author) => {
      const [total, nude] = await Promise.all([
        supabase
          .from("images_resize")
          .select("id", { count: "exact", head: true })
          .eq("author", author)
          .not("filename", "ilike", "000_aaa%"),
        supabase
          .from("images_resize")
          .select("id", { count: "exact", head: true })
          .eq("author", author)
          .eq("nudity", "nude")
          .not("filename", "ilike", "000_aaa%"),
      ]);

      if (total.error) {
        console.error(
          "[SSR fetchPhotographerImageCountsSSR] Total count error",
          total.error,
        );
      }
      if (nude.error) {
        console.error(
          "[SSR fetchPhotographerImageCountsSSR] Nude count error",
          nude.error,
        );
      }

      counts[author] = {
        total: total.count ?? 0,
        nude: nude.count ?? 0,
      };
    }),
  );

  return counts;
}
