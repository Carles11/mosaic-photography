"use client";

import React, { useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { AffiliateProduct, AffiliateAdvertiser } from "@/types/supabase";
import styles from "./ResourcesSlider.module.css";
import Image from "next/image";

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
  const seen = new Set<string>();
  const advertisers: { name: string; slug: string | null }[] = [];
  for (const p of products) {
    const adv = p.affiliate_advertisers;
    if (adv && adv.name && !seen.has(adv.name)) {
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
        ? products
        : products.filter((p) => p.type?.toLowerCase() === selected),
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
        <div className={styles.viewToggle}>
          <button
            className={
              viewMode === "list"
                ? styles.viewToggleBtnActive
                : styles.viewToggleBtn
            }
            onClick={() => setViewMode("list")}
            aria-label="List view"
            type="button"
          >
            {/* List icon SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="5"
                width="14"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="4"
                y="10"
                width="14"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="4"
                y="15"
                width="14"
                height="2"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            className={
              viewMode === "grid"
                ? styles.viewToggleBtnActive
                : styles.viewToggleBtn
            }
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            type="button"
          >
            {/* Grid icon SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="4"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="13"
                y="4"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="4"
                y="13"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="13"
                y="13"
                width="5"
                height="5"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
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
                <div className={styles.card}>
                  {/* Full-bleed image */}
                  <div className={styles.cardImageWrap}>
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="sponsored"
                      style={{
                        display: "block",
                        position: "relative",
                        zIndex: 10, // Bring the link to the front
                        cursor: "pointer",
                        width: "100%",
                      }}
                      className="no-fancy-link"
                    >
                      <Image
                        src={
                          product.image_url ||
                          "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp"
                        }
                        alt={product.title?.[locale] ?? ""}
                        width={250}
                        height={200}
                        className={styles.cardImage}
                      />
                    </a>
                    <div className={styles.cardOverlay} />
                    {/* {product.affiliate_advertisers?.logo_url && (
                      <div className={styles.advertiserBadge}>
                        <Image
                          src={product.affiliate_advertisers.logo_url}
                          alt={product.affiliate_advertisers.name ?? ""}
                          width={75}
                          height={40}
                        />
                      </div>
                    )} */}
                    <div className={styles.productTypeLabel}>
                      {product.type}
                    </div>
                  </div>

                  {/* Advertiser badge */}
                  {/* Content overlays image */}
                  <div className={styles.cardBody}>
                    <div className={styles.productTitle}>
                      {product.photographer_author
                        ? `${product.photographer_author}’s ${product.title?.[locale] ?? ""}`
                        : (product.title?.[locale] ?? "")}
                    </div>
                    <div className={styles.productStore}>
                      {(product.affiliate_advertisers?.name &&
                        `${product.affiliate_advertisers?.name}`) ||
                        ""}
                    </div>
                    <div className={styles.productDesc}>
                      {product.description?.[locale]}
                    </div>
                    <div className={styles.actions}>
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="sponsored"
                        className={styles.affiliateButton}
                      >
                        Shop Now
                      </a>
                      {product.affiliate_advertisers?.slug && (
                        <a
                          href={`/toolkit/${product.affiliate_advertisers.slug}`}
                          className={`${styles.deepDiveLink} no-fancy-link`}
                        >
                          Why I recommend this →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {filtered.map((product) => (
            <div className={styles.gridItem} key={product.id}>
              <div className={styles.card}>
                <div className={styles.cardImageWrap}>
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="sponsored"
                    style={{
                      display: "block",
                      position: "relative",
                      zIndex: 10,
                      cursor: "pointer",
                    }}
                    className="no-fancy-link"
                  >
                    <Image
                      src={
                        product.image_url ||
                        "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp"
                      }
                      alt={product.title?.[locale] ?? ""}
                      width={250}
                      height={200}
                      className={styles.cardImage}
                    />
                  </a>
                  <div className={styles.cardOverlay} />
                  <div className={styles.productTypeLabel}>{product.type}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.productTitle}>
                    {product.photographer_author
                      ? `${product.photographer_author}’s ${product.title?.[locale] ?? ""}`
                      : (product.title?.[locale] ?? "")}
                  </div>
                  <div className={styles.productStore}>
                    {(product.affiliate_advertisers?.name &&
                      `${product.affiliate_advertisers?.name}`) ||
                      ""}
                  </div>
                  <div className={styles.productDesc}>
                    {product.description?.[locale]}
                  </div>
                  <div className={styles.actions}>
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="sponsored"
                      className={styles.affiliateButton}
                    >
                      Shop Now
                    </a>
                    {product.affiliate_advertisers?.slug && (
                      <a
                        href={`/toolkit/${product.affiliate_advertisers.slug}`}
                        className={`${styles.deepDiveLink} no-fancy-link`}
                      >
                        Why I recommend this →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ResourcesSlider;
