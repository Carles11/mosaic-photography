"use client";
import styles from "./PhotographerLinks.module.css";
import { sendGTMEvent } from "@next/third-parties/google";

interface Store {
  store: string;
  website: string;
  affiliate?: boolean;
}

interface PhotographerLinksProps {
  stores?: Store[] | string[];
  website?: string;
}

export const PhotographerLinks: React.FC<PhotographerLinksProps> = ({
  stores,
  website,
}) => {
  // Normalize stores to array of Store objects if needed
  const parsedStores: Store[] = Array.isArray(stores)
    ? stores.map((store) => {
        if (typeof store === "string") {
          try {
            return JSON.parse(store);
          } catch {
            return { store, website: "" };
          }
        }
        return store as Store;
      })
    : [];

  return (
    <div>
      <span className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Stores:</h3>
        <p>
          Find books and prints from this photographer in the following stores:
        </p>
      </span>
      {parsedStores.length > 0 && (
        <div>
          <ul>
            {parsedStores.map((store, idx) => (
              <li key={idx}>
                {store.website ? (
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      sendGTMEvent({
                        event: "storeClicked-in-page",
                        value: store.store,
                        website: store.website,
                      })
                    }
                  >
                    {store.store}
                  </a>
                ) : (
                  store.store
                )}
                {store.affiliate ? " (affiliate)" : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <span className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Learn more:</h3>
        {website && (
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
        )}
      </span>
    </div>
  );
};

export default PhotographerLinks;
