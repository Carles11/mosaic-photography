// filepath: /c:/Users/Usuario/Documents/AAA_REPOs/mosaic/src/components/header/index.tsx
"use client";
import Image from "next/image";
import styles from "./header.module.css";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";

const Header = () => {
  const { toggleView } = useAppContext();

  return (
    <header>
      <nav className={styles.navContainer}>
        <ul className={styles.navGrid}>
          <Link href="/">
            <li className={styles.navItem}>
              <Image
                src="/logos/svg/logo-no-background.svg"
                alt="Mosaic photography logo"
                width={500}
                height={200}
              />
            </li>
          </Link>
          <li className={`${styles.navItem} ${styles.sticky}`}>
            <div onClick={() => toggleView("authors")}>
              <Image
                src="/icons/authors-list-icon-round-colored.png"
                alt="Mosaic Icon"
                width={50}
                height={50}
              />{" "}
            </div>
            <div onClick={() => toggleView("mosaic")}>
              <Image
                src="/icons/mosaic-icon-round-colored.png"
                alt="Mosaic Icon"
                width={50}
                height={50}
              />{" "}
            </div>
          </li>
          <li className={`${styles.navItem} ${styles.sticky}`}>
            <h1>darkmodus switch</h1>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
