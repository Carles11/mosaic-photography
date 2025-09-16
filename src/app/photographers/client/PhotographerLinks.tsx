"use client";
import styles from "./PhotographerLinks.module.css";

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
                    onClick={() => {
                      if (typeof window !== "undefined" && window.gtag) {
                        window.gtag("event", "storeClicked", {
                          event_category: "photographer",
                          event_label: store.website,
                        });
                      }
                    }}
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
            onClick={() => {
              if (typeof window !== "undefined" && window.gtag) {
                window.gtag("event", "websiteClicked", {
                  event_category: "photographer",
                  event_label: website,
                });
              }
            }}
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
