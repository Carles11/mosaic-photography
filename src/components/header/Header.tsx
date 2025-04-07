"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "react-tooltip";

import ThemeToggle from "../theme/ThemeToggle";
import ThemeImage from "../theme/ThemeImageDark";
import GoProModal from "@/components/modals/goProModal/GoProModal";

import styles from "./header.module.css";

const Header = () => {
  const { toggleView } = useAppContext();
  const [showGoProModal, setShowGoProModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const handleIconClick = (view: string) => {
    if (!isHome) {
      router.push("/");
    }
    toggleView(view);
  };

  return (
    <header>
      <h2 className="sr-only">
        Mosaic Photography: Iconic Nude Photography Gallery
      </h2>
      <nav className={styles.navContainer}>
        <ul className={styles.navGrid}>
          {isHome && (
            <li className={styles.navLogo}>
              <Link href="/">
                <ThemeImage
                  srcLight="/logos/svg/mosaic-high-resolution-logo-grayscale-transparent.svg"
                  srcDark="/logos/svg/mosaic-high-resolution-logo-transparent.svg"
                  srcLightMobile="/logos/svg/mosaic-high-resolution-logo-grayscale-transparent-cropped_.svg"
                  srcDarkMobile="/logos/svg/mosaic-high-resolution-logo-transparent-cropped_.svg"
                  alt="Mosaic Logo"
                  className={styles.themeImage}
                  width={0}
                  height={0}
                />
              </Link>
            </li>
          )}
          <li>
            <p
              className={styles.goProText}
              onClick={() => setShowGoProModal(true)}
            >
              Go Pro
            </p>{" "}
          </li>

          <li className={styles.navLinks}>
            <div>
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
                content="Images gallery"
              />
            </div>

            <div>
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
            </div>
            <div>
              <ThemeToggle />
            </div>
          </li>
        </ul>
        {showGoProModal && (
          <GoProModal
            isOpen={showGoProModal}
            onClose={() => setShowGoProModal(false)}
          />
        )}
      </nav>
    </header>
  );
};

export default Header;
