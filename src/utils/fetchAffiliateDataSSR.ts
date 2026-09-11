import { cache } from "react";
import type { DropdownItem } from "@/types/dropdown";
import { shuffleArray } from "@/helpers/shuffle";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import type { AffiliateProduct, AffiliateAdvertiser } from "@/types/supabase";

// Supabase nests the joined table data under the table name
export interface AffiliateProductWithAdvertiser extends AffiliateProduct {
  affiliate_advertisers: AffiliateAdvertiser | null;
}

/** Products of hidden advertisers, and hidden products, are never returned. */
const ACTIVE_SELECT = "*, affiliate_advertisers!inner(*)";

/**
 * A photographer page must never show an empty shelf. If a photographer has
 * fewer than this many products of their own, the shelf is topped up with
 * general ones (see getAffiliateProductsByAuthor).
 *
 * This is not cosmetic. Partners terminate — Amazon did in Sep 2026, taking
 * every per-photographer book with it — and not every photographer has a book
 * in print at any given moment. The top-up means partner churn can no longer
 * empty a page.
 */
const MIN_PRODUCTS_PER_PHOTOGRAPHER = 3;

/**
 * Homepage shelf cap. Kept deliberately small since the June 2026 spam update.
 * Must not exceed the `limit` ResourcesSlider is given, or the slider's own
 * slice would undo the balancing below.
 */
const SHELF_LIMIT = 12;

/** Upper bound on a photographer's shelf: the best few, not everything. */
const MAX_PRODUCTS_PER_PHOTOGRAPHER = 8;

/**
 * Ordering on a photographer page, most-likely-to-be-clicked first:
 * the visitor is looking at this photographer's pictures, so a print of one is
 * the nearest thing to what they already want; then a book that contains their
 * work; then general resources.
 */
const TYPE_RANK: Record<string, number> = {
  print: 0,
  framing: 1,
  book: 2,
  tool: 3,
};

function sortKey(p: AffiliateProductWithAdvertiser): number[] {
  return [
    p.photographer_author ? 0 : 1, // their own things before general ones
    TYPE_RANK[p.type] ?? 8,
    p.featured ? 0 : 1,
    p.sort_order ?? 0,
  ];
}

function byRelevance(
  a: AffiliateProductWithAdvertiser,
  b: AffiliateProductWithAdvertiser,
): number {
  const ka = sortKey(a);
  const kb = sortKey(b);
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return ka[i] - kb[i];
  }
  return 0;
}

/**
 * Types that must never top up a photographer's shelf. Retouching software is
 * a legitimate resource for a working photographer and belongs on the homepage
 * shelf, but it has no business being the entire shelf on the page of someone
 * who died in 1910.
 */
const TOP_UP_EXCLUDED_TYPES = new Set(["tool"]);

/**
 * Ordering for the general pool specifically. Differs from the main ranking:
 * here a history-of-photography book is the most on-topic thing we can offer
 * someone reading about a historic photographer, ahead of print services.
 */
const TOP_UP_TYPE_RANK: Record<string, number> = {
  book: 0,
  print: 1,
  framing: 2,
};

function topUpSortKey(p: AffiliateProductWithAdvertiser): number[] {
  return [
    TOP_UP_TYPE_RANK[p.type] ?? 8,
    p.featured ? 0 : 1,
    p.sort_order ?? 0,
  ];
}

function byTopUpRank(
  a: AffiliateProductWithAdvertiser,
  b: AffiliateProductWithAdvertiser,
): number {
  const ka = topUpSortKey(a);
  const kb = topUpSortKey(b);
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return ka[i] - kb[i];
  }
  return 0;
}

/**
 * Pick `needed` general products, round-robin across advertisers so a shelf
 * never fills up with three near-identical products from one partner, starting
 * at a stable per-author offset so two photographers who both need topping up
 * don't show the identical set — while the same photographer's page still
 * renders identical HTML on every build.
 */
function pickTopUp(
  pool: AffiliateProductWithAdvertiser[],
  author: string,
  needed: number,
): AffiliateProductWithAdvertiser[] {
  const candidates = pool.filter((p) => !TOP_UP_EXCLUDED_TYPES.has(p.type));
  if (candidates.length === 0 || needed <= 0) return [];

  const byAdvertiser = new Map<string, AffiliateProductWithAdvertiser[]>();
  for (const p of candidates) {
    const key = p.affiliate_advertisers?.name ?? "unknown";
    const group = byAdvertiser.get(key);
    if (group) group.push(p);
    else byAdvertiser.set(key, [p]);
  }

  const groups = [...byAdvertiser.keys()]
    .sort()
    .map((k) => byAdvertiser.get(k)!.sort(byTopUpRank));

  const start = offsetForAuthor(author, groups.length);
  const picked: AffiliateProductWithAdvertiser[] = [];
  for (let depth = 0; picked.length < needed; depth++) {
    let addedThisPass = false;
    for (let i = 0; i < groups.length && picked.length < needed; i++) {
      const group = groups[(start + i) % groups.length];
      if (depth < group.length) {
        picked.push(group[depth]);
        addedThisPass = true;
      }
    }
    if (!addedThisPass) break; // pool exhausted
  }
  return picked;
}

/**
 * Stable per-author offset, so the choice varies between photographers but not
 * between builds of the same page.
 */
function offsetForAuthor(author: string, length: number): number {
  if (length <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < author.length; i++) {
    hash = (hash * 31 + author.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

/**
 * The homepage shelf is capped at 12 cards — a deliberate decision after the
 * June 2026 spam update, when homepage affiliate links were cut from 88 to 12.
 * It also has per-type tabs (Books / Prints / Framing / Tools).
 *
 * Those two facts fight each other if the 12 are picked by relevance alone:
 * whichever type happens to sort last is cut entirely and its tab renders
 * empty. That is what happened when Amazon was hidden — the shelf came out as
 * 5 tools, 5 framing, 2 books and no prints at all.
 *
 * So the 12 are allocated round-robin across the types instead, which keeps
 * the cap, keeps every tab populated, and stops any one partner with a deep
 * catalogue from taking the whole shelf.
 */
const SHELF_TYPE_ORDER = ["book", "print", "framing", "tool"];

export async function getGeneralAffiliateResources(): Promise<
  AffiliateProductWithAdvertiser[]
> {
  // `!inner` turns the join into a filter: products of hidden advertisers
  // (is_active = false) are dropped, as are hidden products.
  const { data, error } = await supabaseServerClient
    .from("affiliate_products")
    .select(ACTIVE_SELECT)
    .eq("is_active", true)
    .eq("affiliate_advertisers.is_active", true)
    // The homepage slider is a *general* resources shelf. Photographer-specific
    // products belong on that photographer's page, reached via
    // getAffiliateProductsByAuthor.
    .is("photographer_author", null);

  if (error) {
    console.error("Error fetching general affiliate resources:", error);
    return [];
  }

  const products = (data ?? []) as AffiliateProductWithAdvertiser[];

  // Shuffled first so the mix varies between builds, as it always has; the
  // balance below holds regardless of the order it sees.
  const byType = new Map<string, AffiliateProductWithAdvertiser[]>();
  for (const p of shuffleArray(products)) {
    const key = p.type ?? "other";
    const group = byType.get(key);
    if (group) group.push(p);
    else byType.set(key, [p]);
  }

  // Featured items lead within their own type.
  for (const group of byType.values()) {
    group.sort(
      (a, b) =>
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
  }

  const orderedTypes = [
    ...SHELF_TYPE_ORDER.filter((t) => byType.has(t)),
    ...[...byType.keys()].filter((t) => !SHELF_TYPE_ORDER.includes(t)),
  ];

  const shelf: AffiliateProductWithAdvertiser[] = [];
  for (let depth = 0; shelf.length < SHELF_LIMIT; depth++) {
    let addedThisPass = false;
    for (const type of orderedTypes) {
      if (shelf.length >= SHELF_LIMIT) break;
      const group = byType.get(type)!;
      if (depth < group.length) {
        shelf.push(group[depth]);
        addedThisPass = true;
      }
    }
    if (!addedThisPass) break; // every type exhausted
  }

  return shelf;
}

/**
 * Products for one photographer's page: everything tied to them, ordered by
 * how likely it is to be what they want, topped up with general resources so
 * the shelf is never empty or nearly empty.
 */
export async function getAffiliateProductsByAuthor(
  author: string,
  options: { minimum?: number; limit?: number } = {},
): Promise<AffiliateProductWithAdvertiser[]> {
  const minimum = options.minimum ?? MIN_PRODUCTS_PER_PHOTOGRAPHER;
  const limit = options.limit ?? MAX_PRODUCTS_PER_PHOTOGRAPHER;

  const { data, error } = await supabaseServerClient
    .from("affiliate_products")
    .select(ACTIVE_SELECT)
    .eq("photographer_author", author)
    .eq("is_active", true)
    .eq("affiliate_advertisers.is_active", true);

  if (error) {
    console.error(
      `Error fetching affiliate products for author ${author}:`,
      error,
    );
    return [];
  }

  const own = (data ?? []) as AffiliateProductWithAdvertiser[];
  if (own.length >= minimum) {
    return own.sort(byRelevance).slice(0, limit);
  }

  // Top up. These carry photographer_author = null, and PhotographerLinks
  // renders them without attributing them to this photographer, so the shelf
  // stays honest: general books and materials under a general heading.
  const { data: generalData, error: generalError } = await supabaseServerClient
    .from("affiliate_products")
    .select(ACTIVE_SELECT)
    .is("photographer_author", null)
    .eq("is_active", true)
    .eq("affiliate_advertisers.is_active", true);

  if (generalError) {
    console.error("Error fetching top-up affiliate products:", generalError);
    return own.sort(byRelevance).slice(0, limit);
  }

  const pool = (generalData ?? []) as AffiliateProductWithAdvertiser[];
  const topUp = pickTopUp(pool, author, minimum - own.length);

  return [...own.sort(byRelevance), ...topUp].slice(0, limit);
}

/**
 * Wrapped in React.cache: generateMetadata and the page component both need
 * this, and without deduping every toolkit page made the same Supabase round
 * trip twice per request.
 */
/**
 * How many paid links a photographer card on the homepage may show.
 *
 * Deliberately one. The homepage takes 330 of this site's 334 search clicks,
 * so it is both the only page that matters commercially and the page that was
 * carrying 88 affiliate links when the June 2026 spam update hit. The cards
 * previously rendered up to three dead Amazon links each from the legacy
 * `store` column - roughly 24 undisclosed links that were never counted in
 * the cut to 12. One tracked, disclosed, on-topic book per card puts the
 * homepage at ~18 total instead of ~36.
 */
const MAX_CARD_LINKS_PER_PHOTOGRAPHER = 1;

/**
 * Paid links for the homepage photographer cards, keyed by photographers.author
 * and already shaped as DropdownItem so the card component holds no affiliate
 * logic of its own.
 *
 * Fine Art America is excluded, as it was from the old `store` rendering and
 * as it is from the resources shelf: that programme was never joined, so its
 * links are untracked. Revisit when Awin 88153 approves.
 */
export async function getPhotographerCardLinks(): Promise<
  Record<string, DropdownItem[]>
> {
  const { data, error } = await supabaseServerClient
    .from("affiliate_products")
    .select(ACTIVE_SELECT)
    .eq("is_active", true)
    .eq("affiliate_advertisers.is_active", true)
    .not("photographer_author", "is", null);

  if (error) {
    console.error("Error fetching photographer card links:", error);
    return {};
  }

  const products = ((data ?? []) as AffiliateProductWithAdvertiser[])
    .filter(
      (p) =>
        p.affiliate_advertisers?.name?.toLowerCase() !== "fine art america",
    )
    .sort(byRelevance);

  const byAuthor: Record<string, DropdownItem[]> = {};
  for (const p of products) {
    const author = p.photographer_author;
    if (!author) continue;
    const bucket = (byAuthor[author] ??= []);
    if (bucket.length >= MAX_CARD_LINKS_PER_PHOTOGRAPHER) continue;

    const title = p.title?.en ?? "";
    const description = p.description?.en ?? "";
    bucket.push({
      store: p.affiliate_advertisers?.name ?? "",
      website: p.affiliate_url,
      affiliate: true,
      description: [title, description].filter(Boolean).join(" - "),
    });
  }

  return byAuthor;
}

export const getToolkitDataBySlug = cache(async (slug: string) => {
  const { data, error } = await supabaseServerClient
    .from("affiliate_advertisers")
    .select(
      `
      *,
      products:affiliate_products(*)
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("products.is_active", true)
    .single();

  if (error) {
    console.error(`Error fetching toolkit data for slug ${slug}:`, error);
    return null;
  }

  return data;
});
