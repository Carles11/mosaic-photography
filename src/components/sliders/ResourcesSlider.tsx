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
  { label: "Tools", value: "tool" },
  { label: "Framing", value: "framing" },
  { label: "Books", value: "book" },
  { label: "Prints", value: "print" },
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
}

export const ResourcesSlider: React.FC<ResourcesSliderProps> = ({
  products,
  locale = "en",
}) => {
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

  return (
    <section className={styles.resourcesSliderSection}>
      <div className={styles.topRow}>
        <div className={styles.pillsRow}>
          {FILTERS.map((f) => (
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
