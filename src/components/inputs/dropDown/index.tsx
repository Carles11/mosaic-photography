import React from "react";
import styles from "./Dropdown.module.css";

interface DropdownProps {
  buttonText: string;
  items: { store: string; website: string; affiliate: boolean }[];
  onToggle?: (isOpen: boolean) => void; // New prop
}

const Dropdown: React.FC<DropdownProps> = ({ buttonText, items, onToggle }) => {
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    onToggle?.((event.target as HTMLDetailsElement).open);
  };

  return (
    <details className={styles.dropdown} onToggle={handleToggle}>
      <summary role="button">
        <p className={styles.button}>{buttonText.toUpperCase()}</p>
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
