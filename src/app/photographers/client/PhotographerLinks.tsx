"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import styles from "./PhotographerLinks.module.css";
import { sendGTMEvent } from "@next/third-parties/google";

interface Store {
  store: string;
  website: string;
  affiliate?: boolean;
  image?: string;
  item?: string;
  description?: string;
}

interface PhotographerLinksProps {
  stores?: Store[] | string[];
  website?: string;
}

const isAmazon = (s?: Store) =>
  !!s &&
  typeof s.store === "string" &&
  s.store.toLowerCase().includes("amazon");

function normalizeImageUrl(raw?: unknown): string | null {
  if (!raw) return null;
  let value = String(raw).trim();

  // Attempt JSON parse if value itself is a JSON-encoded string
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "string") {
      value = parsed.trim();
    }
  } catch {
    // ignore
  }

  // Remove literal backslashes left from double-escaping
  value = value.replace(/\\+/g, "");

  // Strip surrounding quotes
  value = value.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "");

  // Extract first http(s) match
  const httpMatch = value.match(/https?:\/\/[^\s'"]+/i);
  if (httpMatch) value = httpMatch[0];

  // Ensure scheme is present
  if (!/^https?:\/\//i.test(value)) return null;

  // extra defensive: encode URI to avoid illegal characters (preserves slashes)
  try {
    // Only encode characters that need it, don't double-encode an already safe URL
    value = encodeURI(decodeURI(value));
  } catch {
    // ignore encoding errors
  }

  return value;
}

const PLACEHOLDER_DATA_URI =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><rect width='100%' height='100%' fill='#fbfbfd'/><g fill='#e6e9ee'><rect x='16' y='28' width='128' height='96' rx='6'/></g><g fill='#d1d5db' font-family='Arial, Helvetica, sans-serif' font-size='12'><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af'>no image</text></g></svg>`
  );

export const PhotographerLinks: React.FC<PhotographerLinksProps> = ({
  stores,
  website,
}) => {
  const parsedStores: Store[] = useMemo(() => {
    if (!Array.isArray(stores)) return [];

    return stores.map((store) => {
      if (typeof store === "string") {
        try {
          const parsed = JSON.parse(store);
          if (parsed && typeof parsed === "object") return parsed as Store;
        } catch {
          return { store, website: "" };
        }
      }
      return store as Store;
    });
  }, [stores]);

  if (!parsedStores.length) return null;

  const onCardClick = (s: Store) => {
    sendGTMEvent({
      event: "storeClicked-in-page",
      value: s.store,
      website: s.website,
      item: s.item ?? null,
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
        {parsedStores.map((s, idx) => {
          const amazon = isAmazon(s);
          const rel = amazon
            ? "nofollow noopener noreferrer"
            : "noopener noreferrer";
          const target = "_blank";

          // Compute normalized URL and keep raw for fallback
          const normalized = normalizeImageUrl(s.image);
          const raw = typeof s.image === "string" ? s.image.trim() : "";

          // DEBUG: print normalized/raw to console so you can inspect actual values
          // Remove or silence these logs after debugging

          console.debug(
            `[PhotographerLinks] image[%d] store=%s normalized=%s raw=%s`,
            idx,
            s.store,
            normalized,
            raw
          );

          // Alt fallback
          const alt = s.image
            ? `${s.store}${s.item ? ` — ${s.item}` : ""}`
            : `${s.store} logo`;

          // We'll store current src state in a ref-like variable in closure to attempt fallback once
          let attemptedFallback = false;

          return (
            <article
              key={idx}
              className={`${styles.card} ${amazon ? styles.amazon : ""}`}
              role="listitem"
            >
              <a
                className={styles.cardLink}
                href={s.website || "#"}
                target={target}
                rel={rel}
                onClick={() => onCardClick(s)}
                aria-label={`${s.store}${s.item ? ` — ${s.item}` : ""}`}
              >
                <div className={styles.cardMedia}>
                  <Image
                    src={normalized || raw || PLACEHOLDER_DATA_URI}
                    alt={alt}
                    className={styles.cardImage}
                    width={80}
                    height={80}
                    onError={(e) => {
                      const img = e.currentTarget;
                      // Log the failing src and an easy hint for debugging (Network/Console)

                      console.error(
                        `[PhotographerLinks] image load failed for store="${s.store}" src="${img.src}"`,
                        {
                          normalized,
                          raw,
                          idx,
                        }
                      );

                      // If we haven't tried the raw fallback yet, try raw
                      if (!attemptedFallback && raw && raw !== normalized) {
                        attemptedFallback = true;

                        console.warn(
                          `[PhotographerLinks] trying raw fallback for store="${s.store}" -> ${raw}`
                        );
                        img.onerror = null; // avoid loop if fallback fails
                        img.src = raw;
                        return;
                      }

                      // Final fallback: inline placeholder
                      img.onerror = null;
                      img.src = PLACEHOLDER_DATA_URI;
                    }}
                  />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeading}>
                    <span className={styles.storeName}>{s.store}</span>
                    {s.item && (
                      <span className={styles.itemBadge}>
                        {String(s.item).toLowerCase()}
                      </span>
                    )}
                  </div>

                  {s.description && (
                    <p className={styles.description}>{s.description}</p>
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
