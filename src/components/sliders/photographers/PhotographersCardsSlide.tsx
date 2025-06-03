import PhotographersViewCard from "@/components/cards/PhotographersViewCard";
import styles from "./PhotographersCardSlide.module.css";

const PhotographersCardsSlide = () => {
  return (
    <div className={styles.photographersCardsSlideContainer}>
      <h2 className={styles.subTitle}>ALL ARTISTS</h2>
      <PhotographersViewCard />
    </div>
  );
};

export default PhotographersCardsSlide;
