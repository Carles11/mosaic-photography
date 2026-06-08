import styles from "./Dropdown.module.css";
import type { DropdownProps } from "@/types";
import { sendGTMEvent } from "@next/third-parties/google";

const Dropdown: React.FC<DropdownProps> = ({ buttonText, items, onToggle }) => {
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    onToggle?.((event.target as HTMLDetailsElement).open);
  };

  return (
    <details className={styles.dropdown} onToggle={handleToggle}>
      <summary role="button">
        <div className={`fancy-link ${styles.link}`}>{buttonText}</div>
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
                  event: "storeClicked",
                  value: item.store,
                })
              }
            >
              {/* {item.store} */}
              {item.description && (
                <p className={`${styles.description} no-fancy-link`}>
                  {item.description}
                </p>
              )}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
};

export default Dropdown;
