import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";

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
    return () => window.removeEventListener("scroll", handleScroll);
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
        style={{
          backgroundColor: "var(--background-color)",
          color: "var(--text-color)",
          zIndex: 99999,
        }}
      />
    </>
  );
};

export default GoToTopButton;
