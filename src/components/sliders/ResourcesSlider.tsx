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
      <div className={styles.sectionMeta}>
        <h2 className={styles.sectionTitle}>The Mosaic Toolkit</h2>
        <p className={styles.sectionSub}>
          Curated tools &amp; resources for photographers
        </p>
      </div>

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
                  <Image
                    src={product.image_url || "/default.jpg"}
                    alt={product.title?.[locale] ?? ""}
                    fill
                    className={styles.cardImage}
                  />
                  <div className={styles.cardOverlay} />
                </div>

                {/* Advertiser badge */}
                {product.affiliate_advertisers?.logo_url && (
                  <div className={styles.advertiserBadge}>
                    <Image
                      src={product.affiliate_advertisers.logo_url}
                      alt={product.affiliate_advertisers.name ?? ""}
                      width={40}
                      height={40}
                    />
                  </div>
                )}

                {/* Content overlays image */}
                <div className={styles.cardBody}>
                  <div className={styles.productTitle}>
                    {product.title?.[locale]}
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
                    <a
                      href={`/guides/${product.id}`}
                      className={styles.deepDiveLink}
                    >
                      Why I recommend this →
                    </a>
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
