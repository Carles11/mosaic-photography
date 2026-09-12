"use client";

import React, { useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { AffiliateProduct, AffiliateAdvertiser } from "@/types/supabase";
import styles from "./ResourcesSlider.module.css";
import ToolkitCard from "@/components/cards/toolkit/toolkitCard";
import ViewToggleButtons from "@/components/buttons/viewToggleButtons";

export interface AffiliateProductWithAdvertiser extends AffiliateProduct {
  affiliate_advertisers: AffiliateAdvertiser | null;
}

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Books", value: "book" },
  { label: "Prints", value: "print" },
  { label: "Framing", value: "framing" },
  { label: "Tools", value: "tool" },
];

// Helper to get unique advertisers for a set of products
function getUniqueAdvertisers(products: AffiliateProductWithAdvertiser[]) {
  // TEMPORARY EXCLUSION: Remove 'fine art america' until partnership is confirmed.
  // To reactivate, remove the .toLowerCase() === 'fine art america' check below.
  const seen = new Set<string>();
  const advertisers: { name: string; slug: string | null }[] = [];
  for (const p of products) {
    const adv = p.affiliate_advertisers;
    if (
      adv &&
      adv.name &&
      adv.name.toLowerCase() !== "fine art america" &&
      !seen.has(adv.name)
    ) {
      seen.add(adv.name);
      advertisers.push({ name: adv.name, slug: adv.slug ?? null });
    }
  }
  return advertisers;
}

interface ResourcesSliderProps {
  products: AffiliateProductWithAdvertiser[];
  locale?: string;
  /** Max cards to render (featured first, then sort_order). Omit for all. */
  limit?: number;
}

export const ResourcesSlider: React.FC<ResourcesSliderProps> = ({
  products: allProducts,
  locale = "en",
  limit,
}) => {
  // Take the order we are given. This used to re-sort by featured then
  // sort_order, which quietly undid the balancing done in
  // getGeneralAffiliateResources: Retouch4me has five featured products at
  // sort_order 0-5 and TASCHEN's books sit at 20 and 40, so the shelf always
  // opened with three retouching tools no matter what the server sent.
  const products = useMemo(
    () => (limit ? allProducts.slice(0, limit) : allProducts),
    [allProducts, limit],
  );

  // Only offer a tab if something is behind it. "Prints" sat there empty once
  // Poster Master and Big Wall Decor were hidden, and a tab that answers a
  // click with a blank shelf reads as a broken page.
  const availableFilters = useMemo(() => {
    const present = new Set(
      products
        .filter(
          (p) =>
            p.affiliate_advertisers?.name?.toLowerCase() !== "fine art america",
        )
        .map((p) => p.type?.toLowerCase()),
    );
    return FILTERS.filter((f) => f.value === "all" || present.has(f.value));
  }, [products]);

  const [selected, setSelected] = useState("all");
  const [advertiser, setAdvertiser] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Filter by type
  const filteredByType = useMemo(
    () =>
      selected === "all"
        ? products.filter(
            // TEMPORARY EXCLUSION: Remove 'fine art america' until partnership is confirmed.
            // To reactivate, remove the .toLowerCase() === 'fine art america' check below.
            (p) =>
              p.affiliate_advertisers?.name?.toLowerCase() !==
              "fine art america",
          )
        : products.filter(
            (p) =>
              p.type?.toLowerCase() === selected &&
              p.affiliate_advertisers?.name?.toLowerCase() !==
                "fine art america",
          ),
    [products, selected],
  );

  // Get unique advertisers for this type
  const advertisers = useMemo(
    () => getUniqueAdvertisers(filteredByType),
    [filteredByType],
  );

  // Filter by advertiser if set
  const filtered = useMemo(
    () =>
      advertiser
        ? filteredByType.filter(
            (p) => p.affiliate_advertisers?.name === advertiser,
          )
        : filteredByType,
    [filteredByType, advertiser],
  );

  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

  // Reset advertiser filter when type changes
  React.useEffect(() => {
    setAdvertiser(null);
  }, [selected]);

  React.useEffect(() => {
    if (!availableFilters.some((f) => f.value === selected)) setSelected("all");
  }, [availableFilters, selected]);

  return (
    <section className={styles.resourcesSliderSection}>
      <div className={styles.topRow}>
        <div className={styles.pillsRow}>
          {availableFilters.map((f) => (
            <button
              key={f.value}
              className={selected === f.value ? styles.pillActive : styles.pill}
              onClick={() => setSelected(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ViewToggleButtons viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Advertiser pills row, only show if type is not 'all' and there are multiple advertisers */}
      {selected !== "all" && advertisers.length > 1 && (
        <div className={styles.advertiserPillsRow}>
          <button
            className={
              advertiser === null
                ? styles.advertiserPillActive
                : styles.advertiserPill
            }
            onClick={() => setAdvertiser(null)}
          >
            All Advertisers
          </button>
          {advertisers.map((adv) => (
            <button
              key={adv.name}
              className={
                advertiser === adv.name
                  ? styles.advertiserPillActive
                  : styles.advertiserPill
              }
              onClick={() => setAdvertiser(adv.name)}
            >
              {adv.name}
            </button>
          ))}
        </div>
      )}

      {viewMode === "list" ? (
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {filtered.map((product) => (
              <div className={styles.emblaSlide} key={product.id}>
                <ToolkitCard product={product} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {filtered.map((product) => (
            <div className={styles.gridItem} key={product.id}>
              <ToolkitCard product={product} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ResourcesSlider;
