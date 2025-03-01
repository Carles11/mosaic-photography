"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

import Image from "next/image";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDarkScheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const defaultTheme = storedTheme || (prefersDarkScheme ? "dark" : "light");
    setTheme(defaultTheme);
    document.documentElement.setAttribute("data-theme", defaultTheme);
  }, []);

  return (
    <button className={styles.toggleButton} onClick={toggleTheme}>
      {theme === "light" ? (
        <Image
          src="/icons/theme-moon.png"
          width={24}
          height={24}
          alt="dark mode"
        />
      ) : (
        <Image
          src="/icons/theme-sun.png"
          width={24}
          height={24}
          alt="light mode"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
