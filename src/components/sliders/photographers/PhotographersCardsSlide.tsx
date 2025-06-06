import PhotographersViewCard from "@/components/cards/PhotographersViewCard";
import styles from "./PhotographersCardSlide.module.css";

const PhotographersCardsSlide = () => {
  return (
    <div className={styles.photographersCardsSlideContainer}>
      <h2 className={styles.subTitle} id="artists-gallery-title">
        VINTAGE NUDE ART PHOTOGRAPHERS
      </h2>
      <p className={styles.sectionIntro}>
        Discover iconic nude art photographers and their copyright free
        contributions.
      </p>
      <PhotographersViewCard />
    </div>
  );
};

export default PhotographersCardsSlide;
