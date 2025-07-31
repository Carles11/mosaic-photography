import Link from "next/link";
import styles from "./BottomNav.module.css";
import { sendGTMEvent } from "@next/third-parties/google";

interface BottomNavItemProps {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const BottomNavItem = ({
  icon,
  label,
  href,
  onClick,
  isActive = false,
}: BottomNavItemProps) => {
  const className = `no-fancy-link ${styles.navItem} ${isActive ? styles.navItemActive : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        <span className={styles.navIcon}>{icon}</span>
        <span className={styles.navLabel}>{label}</span>
      </Link>
    );
  }

  return (
    <button
      className={className}
      onClick={() => {
        sendGTMEvent({
          event: "Mobile-Navigation-Click",
          value: `Mobile-Navigation-${label}`,
          icon,
        });
        if (onClick) {
          onClick();
        }
      }}
    >
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navLabel}>{label}</span>
    </button>
  );
};

export default BottomNavItem;
