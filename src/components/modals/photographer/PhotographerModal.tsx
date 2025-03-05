import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./photographerModal.module.css";
import { Photographer } from "@/types";

interface PhotographerModalProps {
  photographer: Photographer;
  onClose: () => void;
}

const PhotographerModal: React.FC<PhotographerModalProps> = ({
  photographer,
  onClose,
}) => {
  const [isBiographyExpanded, setIsBiographyExpanded] = useState(false);
  const [stores, setStores] = useState<
    { store: string; url: string; affiliate: boolean }[]
  >([]);

  useEffect(() => {
    if (photographer.store) {
      const parsedStores = photographer.store.map((storeString: string) =>
        JSON.parse(storeString)
      );
      setStores(parsedStores);
    }
  }, [photographer.store]);

  const toggleBiography = () => {
    setIsBiographyExpanded(!isBiographyExpanded);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.photographerImageContainer}>
          <Image
            src={photographer.images[0]?.url || ""}
            alt={`${photographer.name} ${photographer.surname}`}
            width={100}
            height={100}
            className={styles.photographerImage}
          />
        </div>
        <div className={styles.photographerInfo}>
          <h2>
            {`${photographer.name} ${photographer.surname}`.toUpperCase()}
          </h2>
          <p
            className={`${styles.biography} ${
              isBiographyExpanded ? styles.expanded : ""
            }`}
            onClick={toggleBiography}
          >
            {photographer.biography || "No biography available."}
          </p>
          <p>
            <strong>Birthdate:</strong>{" "}
            {new Date(photographer.birthdate).toLocaleDateString()}
          </p>
          <p>
            <strong>Origin:</strong> {photographer.origin}
          </p>
          {photographer.deceasedate && (
            <p>
              <strong>Deceasedate:</strong>{" "}
              {new Date(photographer.deceasedate).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className={styles.externalLinks}>
          {photographer.website && (
            <a href="#" className={styles.link}>
              Official website of {photographer.name}: {photographer.website}
            </a>
          )}
          {photographer.instagram && (
            <a href="#" className={styles.link}>
              Official instagram of {photographer.name}:{" "}
              {photographer.instagram}
            </a>
          )}
          <a href="#" className={styles.link}>
            Buy Prints
          </a>
          {stores.length > 0 && (
            <select className={styles.storeDropdown}>
              {stores.map((store, index) => (
                <option key={index} value={store.url}>
                  {store.store}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotographerModal;
