import { FC, ReactNode } from 'react';
import { Dialog, Modal } from 'react-aria-components';
import styles from './modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
  className?: string;
}

export const ModalComponent: FC<ModalProps> = ({
  isOpen,
  onOpenChange,
  children,
  className,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={`${styles.modal} ${className || ''}`}
    >
      <Dialog className={styles.dialog}>{children}</Dialog>
    </Modal>
  );
};
