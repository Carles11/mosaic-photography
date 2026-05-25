"use client";

import React, { useState } from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import styles from "./homeTabs.module.css";

const TABS = [
  {
    label: "Photographers",
    anchor: "#our-photographers",
    event: "photographersClicked",
  },
  { label: "Toolkits", anchor: "#toolkits", event: "toolkitsClicked" },
  {
    label: "Gallery",
    anchor: "#gallery-section",
    event: "browseAllPhotosClicked",
  },
];

export const HomeTabs = () => {
  const [activeTab, setActiveTab] = useState("#gallery-section");

  const handleTabClick = (tab: (typeof TABS)[0]) => {
    setActiveTab(tab.anchor);
    sendGTMEvent({ event: tab.event, value: tab.anchor });
  };

  return (
    <div className={styles.tabsContainer}>
      {TABS.map((tab) => (
        <a
          key={tab.anchor}
          href={tab.anchor}
          className={`${styles.tab} ${activeTab === tab.anchor ? styles.active : ""}`}
          onClick={() => handleTabClick(tab)}
        >
          {tab.label}
        </a>
      ))}
    </div>
  );
};
