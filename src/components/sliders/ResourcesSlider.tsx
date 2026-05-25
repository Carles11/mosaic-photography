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

interface ResourcesSliderProps {
  products: AffiliateProductWithAdvertiser[];
  locale?: string;
}

export const ResourcesSlider: React.FC<ResourcesSliderProps> = ({
  products,
  locale = "en",
}) => {
  console.log({ products });
  const [selected, setSelected] = useState("all");
  const filtered = useMemo(
    () =>
      selected === "all"
        ? products
        : products.filter((p) => p.type?.toLowerCase() === selected),
    [products, selected],
  );
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

  return (
    <section className={styles.resourcesSliderSection}>
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
                  <div className={styles.productTypeLabel}>{product.type}</div>
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
    </section>
  );
};

export default ResourcesSlider;
