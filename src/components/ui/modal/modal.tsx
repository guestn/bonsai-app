import { FC, ReactNode } from 'react';
import styles from './modal.module.scss';

interface ModalComponentProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  onClose?: () => void;
}

export const ModalComponent: FC<ModalComponentProps> = ({
  isOpen,
  onOpenChange,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose?.();
    onOpenChange(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={handleOverlayClick} />
      <div className={`${styles.modal} ${styles[size]}`}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {showCloseButton && (
              <button
                onClick={handleClose}
                className={styles.closeButton}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
};
