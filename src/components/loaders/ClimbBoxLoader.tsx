import React from "react";
import { ClimbingBoxLoader } from "react-spinners";
import styles from "./ClimbBox.module.css";

export const ClimbBoxLoaderContainer = (
  color: string,
  size: number,
  loading: boolean
) => {
  return (
    <div className={styles.loaderContainer}>
      <ClimbingBoxLoader color={color} loading={loading} size={size} />
      <p className={styles.loaderText}>Loading images...</p>
    </div>
  );
};
