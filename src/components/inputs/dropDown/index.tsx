import React from "react";
import styles from "./Dropdown.module.css";

interface DropdownProps {
  buttonText: string;
  items: { store: string; website: string; affiliate: boolean }[];
}

const Dropdown: React.FC<DropdownProps> = ({ buttonText, items }) => {
  return (
    <details className={styles.dropdown}>
      <summary role="button">
        <a className={styles.button}>{buttonText}</a>
      </summary>
      <ul>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <a
              href={item.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
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
