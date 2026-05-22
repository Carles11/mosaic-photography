"use client";
import React from "react";
import Image from "next/image";
import styles from "./PhotographerLinks.module.css";
import { sendGTMEvent } from "@next/third-parties/google";
import type { AffiliateProduct, AffiliateAdvertiser } from "@/types/supabase";

export interface AffiliateProductWithAdvertiser extends AffiliateProduct {
  affiliate_advertisers: AffiliateAdvertiser | null;
}

interface PhotographerLinksProps {
  affiliateProducts: AffiliateProductWithAdvertiser[];
  website?: string;
  locale?: string;
}

const PLACEHOLDER_DATA_URI =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><rect width='100%' height='100%' fill='#fbfbfd'/><g fill='#e6e9ee'><rect x='16' y='28' width='128' height='96' rx='6'/></g><g fill='#d1d5db' font-family='Arial, Helvetica, sans-serif' font-size='12'><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af'>no image</text></g></svg>`,
  );

export const PhotographerLinks: React.FC<PhotographerLinksProps> = ({
  affiliateProducts,
  website,
  locale = "en",
}) => {
  if (!affiliateProducts.length) return null;

  const onCardClick = (product: AffiliateProductWithAdvertiser) => {
    sendGTMEvent({
      event: "affiliateProductClicked-in-page",
      value: product.affiliate_advertisers?.name ?? "",
      product: product.title?.[locale] ?? "",
      url: product.affiliate_url,
    });
  };

  return (
    <section className={styles.container} aria-labelledby="photolinks-heading">
      <header className={styles.header}>
        <h2 id="photolinks-heading" className={styles.title}>
          Where to find prints and books
        </h2>
        <p className={styles.subtitle}>
          Curated options from trusted retailers — handpicked selections for
          photography enthusiasts.
        </p>
      </header>

      <div className={styles.grid} role="list" aria-label="Retailers">
        {affiliateProducts.map((product, idx) => {
          const advertiser = product.affiliate_advertisers;
          const rel = advertiser?.platform?.toLowerCase().includes("amazon")
            ? "nofollow noopener noreferrer"
            : "noopener noreferrer";
          const target = "_blank";
          const imageUrl =
            product.image_url || advertiser?.logo_url || PLACEHOLDER_DATA_URI;
          const alt = advertiser?.name || "Retailer logo";

          return (
            <article key={product.id} className={styles.card} role="listitem">
              <a
                className={styles.cardLink}
                href={product.affiliate_url}
                target={target}
                rel={rel}
                onClick={() => onCardClick(product)}
                aria-label={`${advertiser?.name ?? "Retailer"} — ${product.title?.[locale] ?? "Product"}`}
              >
                <div className={styles.cardMedia}>
                  <Image
                    src={imageUrl}
                    alt={alt}
                    className={styles.cardImage}
                    width={80}
                    height={80}
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.onerror = null;
                      img.src = PLACEHOLDER_DATA_URI;
                    }}
                  />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeading}>
                    <span className={styles.storeName}>{advertiser?.name}</span>
                    <span className={styles.itemBadge}>{product.type}</span>
                  </div>

                  <p className={styles.productTitle}>
                    {product.title?.[locale]}
                  </p>
                  {product.description?.[locale] && (
                    <p className={styles.description}>
                      {product.description[locale]}
                    </p>
                  )}

                  <div className={styles.actions}>
                    <span className={styles.visit}>Visit</span>
                    <span className={styles.linkExternal} aria-hidden>
                      ↗
                    </span>
                  </div>
                </div>
              </a>
            </article>
          );
        })}
      </div>

      <section className={styles.more}>
        <h2 className={styles.learnMoreTitle}>Learn more:</h2>
        {website && (
          <p className={styles.learnMore}>
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                sendGTMEvent({
                  event: "websiteClicked-in-page",
                  value: website,
                })
              }
            >
              {website.toLowerCase().includes("wikipedia")
                ? "Wikipedia"
                : "Website"}
            </a>
          </p>
        )}
      </section>
    </section>
  );
};

export default PhotographerLinks;
