"use client";

import React, { FC, useEffect, useRef } from "react";
import styles from "./ModalShell.module.css";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const ModalShell: FC<ModalShellProps> = ({
  isOpen,
  onClose,
  ariaLabel,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Focus the modal content container
    const timer = setTimeout(() => {
      contentRef.current?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      // restore focus
      try {
        previouslyFocused.current?.focus();
      } catch (err) {
        console.log({ err });
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={ariaLabel}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        ref={contentRef}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalShell;
