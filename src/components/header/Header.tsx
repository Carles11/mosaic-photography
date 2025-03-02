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
              srcLight="/logos/svg/logo-grayscale.svg"
              srcDark="/logos/svg/logo-no-background.svg"
              width={500}
              height={200}
              alt="Mosaic Logo"
            />
          </Link>
        </li>
        <div className={styles.navLinks}>
          <li>
            <div onClick={() => toggleView("authors")}>
              <Image
                src="/icons/authors-list-icon-round-colored.png"
                alt="Mosaic Icon"
                width={50}
                height={50}
              />
            </div>
          </li>
          <li>
            <div onClick={() => toggleView("mosaic")}>
              <Image
                src="/icons/mosaic-icon-round-colored.png"
                alt="Mosaic Icon"
                width={50}
                height={50}
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
