"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";

import styles from "./ThemeToggle.module.css";

const Tooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false } // Disable server-side rendering
);

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
    Cookies.set("theme", newTheme, { expires: 365 }); // <-- Use cookie instead of localStorage
  };

  useEffect(() => {
    // Only set theme if there is no stored theme and theme is undefined
    const storedTheme = Cookies.get("theme"); // <-- Check cookie, not localStorage
    if (!storedTheme && !theme) {
      const prefersDarkScheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = prefersDarkScheme ? "dark" : "light";
      setTheme(defaultTheme);
      Cookies.set("theme", defaultTheme, { expires: 365 }); // <-- Set cookie on first run
    }
  }, [setTheme, theme]);

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
          priority={false}
          loading="lazy"
        />
      ) : (
        <Image
          src="/icons/theme-sun.png"
          width={32}
          height={32}
          alt="light mode icon"
          priority={false}
          loading="lazy"
        />
      )}
      <Tooltip anchorSelect="#theme-icon" content={`Go ${theOtherTheme}!`} />
    </button>
  );
};

export default ThemeToggle;
