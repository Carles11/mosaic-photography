import React from "react";
import Image from "next/image";
import styles from "./photographerModal.module.css";
import { Photographer } from "@/types";

interface PhotographerModalProps {
  photographer: Photographer;
  onClose: () => void;
}

const PhotographerModal: React.FC<PhotographerModalProps> = ({ photographer, onClose }) => {
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
          <h2>{`${photographer.name} ${photographer.surname}`.toUpperCase()}</h2>
          <p>{photographer.biography || "No biography available."}</p>
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
          <a href="#" className={styles.link}>
            More Information
          </a>
          <a href="#" className={styles.link}>
            Buy Prints
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotographerModal;
