"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Header.module.css";
import ThemeToggle from "../theme/ThemeToggle";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import ThemeImage from "../theme/ThemeImageDark";

const Header = () => {
  const { toggleView } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }
  return (
    <header>
      <nav className={styles.navContainer}></nav>
      <ul className={styles.navGrid}>
        <li className={styles.navLogo}>
          <Link href="/">
            <ThemeImage
              srcLight="/logos/svg/mosaic-high-resolution-logo-grayscale-transparent.svg"
              srcDark="/logos/svg/mosaic-high-resolution-logo-transparent.svg"
              alt="Mosaic Logo"
              className={styles.themeImage}
              width={0}
              height={0}
            />
          </Link>
        </li>
        <div className={styles.navLinks}>
          <li>
            <div onClick={() => toggleView("authors")}>
              <Image
                src="/icons/authors-list-icon-colored.png"
                alt="Mosaic Icon"
                width={32}
                height={32}
              />
            </div>
          </li>
          <li>
            <div onClick={() => toggleView("mosaic")}>
              <Image
                src="/icons/mosaic-icon-colored.png"
                alt="Mosaic Icon"
                width={32}
                height={32}
              />
            </div>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </div>
      </ul>
    </header>
  );
};

export default Header;
