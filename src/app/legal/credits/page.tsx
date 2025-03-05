"use client";

import React from "react";
import styles from "./credits.module.css";
import Image from "next/image";

const Credits: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Legal</h1>
      <p className={styles.text}>
        This page contains the credits for the icons I used on this website.
      </p>
      <h2 className={styles.subtitle}>Logo Credits</h2>
      <p className={styles.text}>
        The mosaic logo was created for free using{" "}
        <a href="https://logo.com" title="Logo.com">
          Logo.com
        </a>
        .
      </p>
      <h2 className={styles.subtitle}>Icon Credits</h2>
      <p className={styles.text}>
        The icons used on this website are sourced from various free icon
        libraries. We would like to thank the creators of these icons for their
        work.
      </p>

      <ul className={styles.list}>
        <li>
          <a
            href="https://www.flaticon.com/free-icons/author"
            title="author icons"
          >
            Author icons created by Freepik - Flaticon
          </a>
        </li>
        <li>
          <a
            href="https://www.flaticon.com/free-icons/mosaic"
            title="mosaic icons"
          >
            Mosaic icons created by Freepik - Flaticon
          </a>
        </li>
        <li>
          <a
            href="https://www.flaticon.com/free-icons/close"
            title="close icons"
          >
            Close icons created by Uniconlabs - Flaticon
          </a>
        </li>
        <li>
          <a href="https://favicon.io/" title="mosaic favicons">
            Mosaic favicons created by favicon.io
          </a>
        </li>
      </ul>
      <div>
        <h1>About Me</h1>
        <p>
          Hello! I´m a passionate developer who loves coding and creating useful
          tools and content. My name is Carles, the creator of
          mosaic.photography. This website is a labor of love, aimed at
          providing valuable resources and services for free.
        </p>
        <p>
          Maintaining and improving this site takes a lot of time and effort,
          not to mention the costs associated with hosting and development.
          While I do not charge for any of the content or services here, your
          support would greatly help me keep this project alive and thriving.
        </p>
        <p>
          If you find my work valuable and would like to support me, please
          consider buying me a coffee. Your donations will go directly towards
          covering the costs of running this site and enabling me to continue
          doing what I love.
        </p>
        <a
          href="https://ko-fi.com/Q5Q6R6S40"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            height="36"
            width="100"
            style={{ border: "0px", height: "36px" }}
            src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
            alt="Buy Me a Coffee at ko-fi.com"
          />
        </a>
        <p>Thank you for your support!</p>
      </div>
    </div>
  );
};

export default Credits;
