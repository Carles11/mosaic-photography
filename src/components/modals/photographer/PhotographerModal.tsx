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
    { name: string; website: string; affiliate: boolean }[]
  >([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (photographer.store) {
      const parsedStores = photographer.store.map((storeString: string) => {
        const store = JSON.parse(storeString);
        return {
          name: store.name,
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
            <a href={`${photographer.website}`} className={styles.link}>
              Official website of {photographer.author}
            </a>
          )}
          {photographer.instagram && (
            <a href={`${photographer.instagram}`} className={styles.link}>
              Official instagram of {photographer.author}
            </a>
          )}
          <Dropdown buttonText="Buy some stuff!" items={stores} />
        </div>
      </div>
    </div>
  );
};

export default PhotographerModal;
