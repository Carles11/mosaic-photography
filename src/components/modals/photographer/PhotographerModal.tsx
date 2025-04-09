import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import styles from "./photographerModal.module.css";
import { Photographer } from "@/types";
import Dropdown from "@/components/inputs/dropDown";

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
    { store: string; website: string; affiliate: boolean }[]
  >([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (photographer.store) {
      const parsedStores = photographer.store.map((storeString: string) => {
        const store = JSON.parse(storeString);
        return {
          store: store.store,
          website: store.website,
          affiliate: store.affiliate,
        };
      });
      setStores(parsedStores);
    }
  }, [photographer.store]);

  const toggleBiography = () => {
    setIsBiographyExpanded(!isBiographyExpanded);
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    },
    [onClose, modalRef]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div className={styles.photographerImageContainer}>
          <Image
            src={
              photographer.images.find((img) => img.url.startsWith("000_aaa"))
                ?.url ||
              photographer.images[0]?.url ||
              ""
            }
            alt={`${photographer.name} ${photographer.surname}`}
            width={100}
            height={100}
            className={styles.photographerImage}
            unoptimized
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
            <a href={`${photographer.website}`} className={styles.link}>
              Official website
            </a>
          )}
          {photographer.instagram && (
            <a href={`${photographer.instagram}`} className={styles.link}>
              Official instagram
            </a>
          )}
          {stores && stores.length > 0 && (
            <Dropdown
              buttonText="Buy some stuff!"
              items={stores}
              closeBio={setIsBiographyExpanded}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotographerModal;
