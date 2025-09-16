import React from "react";
import styles from "./primaryButton.module.css";

interface PrimaryButtonProps {
  handleClick: () => void;
  btnText: string;
  className: string;
  id?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  handleClick,
  btnText,
  className,
  id,
}) => {
  return (
    <button
      id={id}
      onClick={handleClick}
      className={`${styles.primaryButton} ${className}`}
    >
      {btnText}
    </button>
  );
};

export default PrimaryButton;
