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
      <div className={styles.pillsRow}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={selected === f.value ? styles.pillActive : styles.pill}
            onClick={() => setSelected(f.value)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {filtered.map((product) => {
            const advertiser = product.affiliate_advertisers;
            return (
              <div className={styles.emblaSlide} key={product.id}>
                <div className={styles.card}>
                  <div className={styles.cardImageWrap}>
                    <Image
                      src={
                        product.image_url ||
                        advertiser?.logo_url ||
                        "/favicons/android-chrome-512x512.png"
                      }
                      alt={product.title?.[locale] || "Product image"}
                      width={120}
                      height={120}
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.advertiserRow}>
                      {advertiser?.logo_url && (
                        <Image
                          src={advertiser.logo_url}
                          alt={advertiser.name}
                          width={32}
                          height={32}
                          className={styles.advertiserLogo}
                        />
                      )}
                      <span className={styles.advertiserName}>
                        {advertiser?.name}
                      </span>
                    </div>
                    <div className={styles.productTitle}>
                      {product.title?.[locale]}
                    </div>
                    {product.description?.[locale] && (
                      <div className={styles.productDesc}>
                        {product.description[locale]}
                      </div>
                    )}
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.affiliateButton}
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ResourcesSlider;
