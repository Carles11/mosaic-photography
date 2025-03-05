"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleIconClick = (view: string) => {
    if (!isHome) {
      router.push("/");
    }
    toggleView(view);
  };

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
            <div
              id="mosaic-images-icon"
              onClick={() => handleIconClick("mosaic")}
            >
              <Image
                src="/icons/mosaic-icon-colored.png"
                alt="Mosaic Icon"
                width={32}
                height={32}
              />
            </div>
            <Tooltip
              anchorSelect="#mosaic-images-icon"
              content="Images mosaic gallery"
            />
          </li>
          <li>
            s{" "}
            <div
              id="authors-list-icon"
              onClick={() => handleIconClick("authors")}
            >
              <Image
                src="/icons/authors-list-icon-colored.png"
                alt="Mosaic Icon"
                width={32}
                height={32}
              />
            </div>
            <Tooltip
              anchorSelect="#authors-list-icon"
              content="Photographers list"
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
