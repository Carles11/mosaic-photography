import HomeAppBanner from "@/components/appBanner/HomeAppBanner";
import { HomeTabs } from "../homeTabs/HomeTabs"; // Import your new component
import styles from "./Titles.module.css";

export const HomeTitles = () => {
  return (
    <div className={styles.mainTitleContainer}>
      <div className={styles.homeTitleGrid}>
        <HomeAppBanner />

        <div className={styles.homeTitleTabs}>
          <HomeTabs />
        </div>
      </div>
    </div>
  );
};
