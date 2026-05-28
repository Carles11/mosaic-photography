import React from "react";
import Image from "next/image";
import styles from "./toolkitCard.module.css";
import type { AffiliateProductWithAdvertiser } from "@/components/sliders/ResourcesSlider";

interface ToolkitCardProps {
  product: AffiliateProductWithAdvertiser;
  locale?: string;
}

const ToolkitCard: React.FC<ToolkitCardProps> = ({
  product,
  locale = "en",
}) => {
  return (
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
  );
};

export default ToolkitCard;
