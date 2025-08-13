import styles from "./PhotographersCardSlide.module.css";
import PhotographersViewCard from "@/components/cards/PhotographersViewCard";

interface PhotographersCardsSlideProps {
  onLoginRequired?: () => void;
}

const PhotographersCardsSlide: React.FC<PhotographersCardsSlideProps> = ({ onLoginRequired }) => {
  return (
    <div className={styles.photographersCardsSlideContainer}>
      <h2 className={styles.subTitle} id="artists-gallery-title">
        VINTAGE NUDE ART PHOTOGRAPHERS
      </h2>
      <p className={styles.sectionIntro}>
        Explore their fascinating lives, and view their copyright-free
        contributions to vintage and classic nude photography.
      </p>
      <PhotographersViewCard onLoginRequired={onLoginRequired} />
    </div>
  );
};

export default PhotographersCardsSlide;
