"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

import styles from "./ThemeToggle.module.css";

const Tooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false }, // Disable server-side rendering
);

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
      "(prefers-color-scheme: dark)",
    ).matches;
    const defaultTheme = storedTheme || (prefersDarkScheme ? "dark" : "light");
    setTheme(defaultTheme);
  }, [setTheme]);

  const theOtherTheme = theme === "light" ? "dark" : "light";

  return (
    <button
      id="theme-icon"
      className={styles.toggleButton}
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <Image
          src="/icons/theme-moon.png"
          width={32}
          height={32}
          alt="dark mode icon"
          priority={false} // Set to true for critical images
          loading="lazy"
        />
      ) : (
        <Image
          src="/icons/theme-sun.png"
          width={32}
          height={32}
          alt="light mode icon"
          priority={false} // Set to true for critical images
          loading="lazy"
        />
      )}
      <Tooltip anchorSelect="#theme-icon" content={`Go ${theOtherTheme}!`} />
    </button>
  );
};

export default ThemeToggle;
