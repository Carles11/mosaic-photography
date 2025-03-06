import Image from "next/image";
import Modal from "../mainModal";
import ShareButtons from "@/components/buttons/ShareButtons";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { Tooltip as ReactTooltip } from "react-tooltip";

import styles from "./goProModal.module.css";

interface GoProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const url = "https://www.mosaic.photography";
const title = "Check out this awesome website!";

const GoProModal = ({ isOpen, onClose }: GoProModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} btnText="Close">
      <h1 className={styles.goProTitle}>Great news, there is no pro!</h1>
      <div className={styles.goProContainer}>
        <p className={styles.goProText}>
          <PrimaryButton
            id="copyButton"
            className={styles.copyButton}
            btnText="MOSAIC"
            handleClick={() =>
              navigator.clipboard.writeText("https://www.mosaic.photography")
            }
          />
          is a free site and it will always be.
        </p>
        <p className={styles.goProText}>
          However, it takes a lot of time, resources and quite a bit of money to
          keep alive a site like this. That is why any help is very much
          appreciated.
        </p>
        <p className={styles.goProText}>
          If you would like to help, you can donate to the site.
        </p>
        <a
          href="https://ko-fi.com/Q5Q6R6S40"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            height="36"
            width="144"
            style={{ border: "0px", height: "36px", margin: "0.5rem auto" }}
            src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
            alt="Buy Me a Coffee at ko-fi.com"
          />
        </a>
        <p className={styles.goProText}>
          Or you can also help by sharing the site with your friends and
          collegues.
        </p>
        <ShareButtons url={url} title={title} />
        <p className={styles.goProText}>Thank you for your support!</p>
      </div>
      <ReactTooltip
        anchorSelect="#copyButton"
        content="Copy url to clipboard"
      />
    </Modal>
  );
};

export default GoProModal;
