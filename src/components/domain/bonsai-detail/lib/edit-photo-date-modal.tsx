import { type FormEvent, FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text, TextField, Input, Label } from 'react-aria-components';
import type { BonsaiTree, PhotoMetadata } from '@/types/bonsai';
import { ModalComponent, Button } from '@/components/ui';
import {
  dateInputToTakenAtIso,
  getPhotoDisplayDate,
  toDateInputValue,
} from '@/utils/photo-date';
import styles from './add-event-modal.module.scss';

interface EditPhotoDateModalProps {
  tree: BonsaiTree;
  photo: PhotoMetadata;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (takenAtIso: string | null) => void;
  isLoading?: boolean;
}

export const EditPhotoDateModal: FC<EditPhotoDateModalProps> = ({
  tree,
  photo,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen && photo) {
      setDate(toDateInputValue(getPhotoDisplayDate(photo)));
    }
  }, [isOpen, photo]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!date) return;
    try {
      onSubmit(dateInputToTakenAtIso(date));
    } catch {
      return;
    }
  };

  const handleUseUploadDate = () => {
    onSubmit(null);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setDate('');
    }
    onOpenChange(open);
  };

  return (
    <ModalComponent isOpen={isOpen} onOpenChange={handleModalOpenChange}>
      <Heading slot="title" className={styles.title}>
        {t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.TITLE')}
      </Heading>
      <Text className={styles.description}>
        {t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.DESCRIPTION', {
          treeName: tree.name,
          fileName:
            photo.fileName || t('BONSAI.DETAIL.PHOTO_FALLBACK_LABEL'),
        })}
      </Text>

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.DATE_LABEL')}
          </Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
            disabled={isLoading}
            required
          />
        </TextField>

        <Text className={styles.description}>
          {t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.HINT')}
        </Text>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onPress={() => handleModalOpenChange(false)}
            isDisabled={isLoading}
          >
            {t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.CANCEL')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onPress={handleUseUploadDate}
            isDisabled={isLoading || !photo.takenAt}
          >
            {t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.USE_UPLOAD_DATE')}
          </Button>
          <Button type="submit" variant="primary" isDisabled={isLoading || !date}>
            {isLoading
              ? t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.SAVING')
              : t('BONSAI.DETAIL.EDIT_PHOTO_DATE_MODAL.SAVE')}
          </Button>
        </div>
      </form>
    </ModalComponent>
  );
};
