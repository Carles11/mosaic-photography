"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import ShareButtons from "@/components/buttons/ShareButtons";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import styles from "./goProModal.module.css";
import React from "react";

const ReactTooltip = dynamic(
  () => import("react-tooltip").then((mod) => mod.Tooltip),
  { ssr: false },
);

interface GoProModalBodyProps {
  onClose?: (result?: unknown) => void;
}

export default function GoProModalBody({ onClose }: GoProModalBodyProps) {
  const url = "https://www.mosaic.photography";
  const title = "Check out this awesome website!";

  return (
    <div>
      <h1 className={styles.goProTitle}>There is no Pro Plan</h1>
      <div className={styles.goProContainer}>
        <p className={styles.goProText}>
          I created{" "}
          <PrimaryButton
            id="copyButton"
            className={styles.copyButton}
            btnText="MOSAIC"
            handleClick={() =>
              navigator.clipboard.writeText("https://www.mosaic.photography")
            }
          />{" "}
          to be opensource and free. All its features are and will be forever
          free.
        </p>
        <p className={styles.goProText}>
          However, if you like mosaic, feel free to show your support by buying
          me a coffee. I of course appreciate that very much.
        </p>

        <a
          href="https://ko-fi.com/Q5Q6R6S40"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            height={36}
            width={144}
            className={styles.kofiImage}
            src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
            alt="Buy Me a Coffee at ko-fi.com"
            priority={false}
            loading="lazy"
          />
        </a>
        <p className={styles.goProText}>
          Enjoyed the site? Share it with friends and colleagues or star the
          project on{" "}
          <a
            href="https://github.com/Carles11/mosaic-photography"
            target="_blank"
          >
            GitHub
          </a>
          .
        </p>

        <ShareButtons url={url} title={title} />
        <p className={styles.goProText}>Thank you for your support!</p>
      </div>

      <ReactTooltip
        anchorSelect="#copyButton"
        content="Copy url to clipboard"
      />

      <p className={styles.goProText}>
        Also if you have any questions or feature requests, don&apos;t be shy!
        Hit me up on <a href="mailto:carles@crix.design">carles@crix.design</a>
      </p>

      <div style={{ marginTop: 18 }}>
        <PrimaryButton
          btnText="Close"
          handleClick={() => onClose?.()}
          id=""
          className=""
        />
      </div>
    </div>
  );
}
