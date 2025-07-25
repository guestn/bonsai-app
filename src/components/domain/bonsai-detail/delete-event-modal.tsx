import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text } from 'react-aria-components';
import { BonsaiEvent } from '../../../types/bonsai';
import { ModalComponent, Button } from '../../../components/ui';
import styles from './delete-event-modal.module.scss';

interface DeleteEventModalProps {
  event: BonsaiEvent;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteEventModal: FC<DeleteEventModalProps> = ({
  event,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <ModalComponent isOpen={isOpen} onOpenChange={onOpenChange}>
      <Heading slot="title" className={styles.title}>
        {t('BONSAI.DETAIL.DELETE_MODAL.TITLE')}
      </Heading>
      <Text className={styles.description}>
        {t('BONSAI.DETAIL.DELETE_MODAL.DESCRIPTION', {
          eventDescription: event.description,
        })}
      </Text>
      <div className={styles.actions}>
        <Button
          onPress={() => onOpenChange(false)}
          isDisabled={isLoading}
          variant="secondary"
        >
          {t('BONSAI.DETAIL.DELETE_MODAL.CANCEL')}
        </Button>
        <Button onPress={handleConfirm} isDisabled={isLoading} variant="danger">
          {isLoading
            ? t('BONSAI.DETAIL.DELETE_MODAL.DELETING')
            : t('BONSAI.DETAIL.DELETE_MODAL.DELETE')}
        </Button>
      </div>
    </ModalComponent>
  );
};
