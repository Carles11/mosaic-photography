import styles from "./legal.module.css";

const Legal = () => {
  return (
    <div>
      <h1 className={styles.legalTitle}>Credits</h1>
      <p className={styles.legalText}>
        <a href="https://www.flaticon.com/free-icons/menu" title="menu icons">
          Menu icons created by Freepik - Flaticon
        </a>
      </p>
    </div>
  );
};

export default Legal;
