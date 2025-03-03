"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "react-tooltip";

import ThemeToggle from "../theme/ThemeToggle";
import ThemeImage from "../theme/ThemeImageDark";

import styles from "./header.module.css";

const Header = () => {
  const { toggleView } = useAppContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

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
        {isHome && (
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
        )}
        <div className={styles.navLinks}>
          <li>
            <div id="authors-list-icon" onClick={() => toggleView("authors")}>
              <Image
                src="/icons/authors-list-icon-colored.png"
                alt="Mosaic Icon"
                width={32}
                height={32}
              />
            </div>
            <Tooltip
              anchorSelect="#authors-list-icon"
              content="Show as a list"
            />
          </li>
          <li>
            <div id="mosaic-images-icon" onClick={() => toggleView("mosaic")}>
              <Image
                src="/icons/mosaic-icon-colored.png"
                alt="Mosaic Icon"
                width={32}
                height={32}
              />
            </div>
            <Tooltip
              anchorSelect="#mosaic-images-icon"
              content="Show as a mosaic"
            />
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
