import { FC, ReactNode } from "react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import styles from "./mainModal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  btnText: string;
  children: ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, children, btnText }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {children}
        <PrimaryButton
          handleClick={onClose}
          btnText={btnText}
          className=""
          id=""
        />
      </div>
    </div>
  );
};

export default Modal;
