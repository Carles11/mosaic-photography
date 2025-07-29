import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Tooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false }, // Disable server-side rendering
);

import styles from "./goToTopButton.module.css";

const GoToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const headerHeight = document.querySelector("header")?.offsetHeight || 0;
    const scrollTop = window.scrollY;
    setIsVisible(scrollTop > headerHeight);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <button
        id="go-to-top-button"
        className={`${styles.goToTopButton} ${isVisible ? styles.visible : ""}`}
        onClick={scrollToTop}
        aria-label="Go to top"
      >
        ↑
      </button>{" "}
      <Tooltip
        anchorSelect="#go-to-top-button"
        content="Go to top!"
        className={styles.tooltip}
      />
    </>
  );
};

export default GoToTopButton;
