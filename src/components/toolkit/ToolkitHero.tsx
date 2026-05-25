import React from "react";
import Image from "next/image";
import { AffiliateAdvertiser } from "@/types/supabase";
import styles from "./ToolkitHero.module.css";

interface ToolkitHeroProps {
  advertiser: AffiliateAdvertiser;
  showCTA?: boolean;
}

export default function ToolkitHero({
  advertiser,
  showCTA = true,
}: ToolkitHeroProps) {
  return (
    <section
      className={styles.heroSection}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${advertiser.header_url})`,
      }}
    >
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>{advertiser.name}</h1>

        <span className={styles.platformBadge}>
          VIA {advertiser.platform?.toUpperCase()}
        </span>

        <p className={styles.description}>{advertiser.description}</p>

        {showCTA && advertiser.website_url && (
          <a
            href={advertiser.website_url}
            className={styles.ctaButton}
            target="_blank"
            rel="sponsored"
          >
            Visit {advertiser.name}
          </a>
        )}
      </div>

      {/* Desktop-only logo container */}
      <div className={styles.logoContainer}>
        {advertiser.logo_url && (
          <Image
            src={advertiser.logo_url}
            alt={advertiser.name}
            height={44}
            width={168}
            style={{ maxHeight: 48, objectFit: "contain", width: "auto" }}
          />
        )}
      </div>
    </section>
  );
}
