"use client";
import React from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
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

const PLACEHOLDER_IMAGE =
  "https://cdn.mosaic.photography/logos/mosaic-high-resolution-logo-transparent-DESKTOP-dark_766x541px_lg82w1.webp";

export const PhotographerLinks: React.FC<PhotographerLinksProps> = ({
  affiliateProducts,
  website,
  locale = "en",
}) => {
  const [emblaRef] = useEmblaCarousel({ loop: false, align: "start" });

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
    <section className={styles.section} aria-labelledby="photolinks-heading">
      <div className={styles.sectionMeta}>
        <h2 id="photolinks-heading" className={styles.sectionTitle}>
          Where to find prints &amp; books
        </h2>
        <p className={styles.sectionSub}>
          Curated options from trusted retailers
        </p>
      </div>

      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {affiliateProducts.map((product) => {
            const advertiser = product.affiliate_advertisers;
            const rel = advertiser?.platform?.toLowerCase().includes("amazon")
              ? "nofollow noopener noreferrer"
              : "noopener noreferrer sponsored";
            const imageUrl =
              product.image_url || advertiser?.logo_url || PLACEHOLDER_IMAGE;
            const title = product.photographer_author
              ? `${product.photographer_author}'s ${product.title?.[locale] ?? ""}`
              : (product.title?.[locale] ?? "");

            return (
              <div className={styles.emblaSlide} key={product.id}>
                <a
                  className={styles.card}
                  href={product.affiliate_url}
                  target="_blank"
                  rel={rel}
                  onClick={() => onCardClick(product)}
                  aria-label={`${advertiser?.name ?? "Retailer"} — ${title}`}
                >
                  {/* Full-bleed image */}
                  <div className={styles.cardImageWrap}>
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className={styles.cardImage}
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.onerror = null;
                        img.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div className={styles.cardOverlay} />
                    {/* Type badge */}
                    {product.type && (
                      <span className={styles.typeBadge}>{product.type}</span>
                    )}
                  </div>

                  {/* Content overlays image */}
                  <div className={styles.cardBody}>
                    <div className={styles.storeName}>
                      {advertiser?.name && `Found in ${advertiser.name}`}
                    </div>
                    <div className={styles.productTitle}>{title}</div>
                    {product.description?.[locale] && (
                      <div className={styles.productDesc}>
                        {product.description[locale]}
                      </div>
                    )}
                    <div className={styles.visitBtn}>Visit ↗</div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learn more */}
      {website && (
        <div className={styles.learnMore}>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.learnMoreLink}
            onClick={() =>
              sendGTMEvent({ event: "websiteClicked-in-page", value: website })
            }
          >
            {website.toLowerCase().includes("wikipedia")
              ? "Wikipedia"
              : "Official website"}{" "}
            ↗
          </a>
        </div>
      )}
    </section>
  );
};

export default PhotographerLinks;
