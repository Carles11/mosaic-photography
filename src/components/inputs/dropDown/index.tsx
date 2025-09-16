import React from "react";
import { sendGTMEvent } from "@next/third-parties/google";
import styles from "./Dropdown.module.css";
import type { DropdownProps } from "@/types";

const Dropdown: React.FC<DropdownProps> = ({ buttonText, items, onToggle }) => {
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    onToggle?.((event.target as HTMLDetailsElement).open);
  };

  return (
    <details className={styles.dropdown} onToggle={handleToggle}>
      <summary role="button">
        <div className={`fancy-link ${styles.link} ${styles.paddingLeft}`}>
          {buttonText}
        </div>
      </summary>
      <ul>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              onClick={() =>
                sendGTMEvent({
                  event: "storeClicked-in-dropdown",
                  value: item.store,
                })
              }
            >
              {item.store}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
};

export default Dropdown;
