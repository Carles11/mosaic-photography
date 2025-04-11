import styles from "./siteUnderConstruction.module.css";

const SiteUnderConstruction = () => {
  return (
    <div className={styles.underConstructionContainer}>
      <div>
        <h1>Under Construction</h1>
        <p>
          We are currently working on the database. Please check back later!
        </p>
      </div>
    </div>
  );
};

export default SiteUnderConstruction;
