"use client";

import { useEffect } from "react";
import styles from "./ThemeToggle.module.css";
import { useTheme } from "next-themes";

import Image from "next/image";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDarkScheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const defaultTheme = storedTheme || (prefersDarkScheme ? "dark" : "light");
    setTheme(defaultTheme);
  }, [setTheme]);

  return (
    <button className={styles.toggleButton} onClick={toggleTheme}>
      {theme === "light" ? (
        <Image
          src="/icons/theme-moon.png"
          width={32}
          height={32}
          alt="dark mode"
        />
      ) : (
        <Image
          src="/icons/theme-sun.png"
          width={32}
          height={32}
          alt="light mode"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
