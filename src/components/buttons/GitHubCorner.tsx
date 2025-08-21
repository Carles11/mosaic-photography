import Image from "next/image";
import styles from "./gitHubCorner.module.css";

const GitHubCorner = ({ url }: { url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.githubCorner}
    aria-label="View source on GitHub"
  >
    <Image
      src="/images/public_github-corner.webp"
      alt="View source on GitHub"
      width={80}
      height={80}
      className={styles.githubCornerSvg}
      priority // Ensures it loads immediately
    />
  </a>
);

export default GitHubCorner;
