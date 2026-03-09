import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heading,
  Text,
  TextField,
  Label,
  TextArea,
} from 'react-aria-components';
import { ModalComponent, Button as UIButton } from '../../../ui';
import styles from './add-bonsai-modal.module.scss';

interface AddNoteModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (tree: { note: string }) => void;
  isLoading?: boolean;
  getNotes: () => Promise<string>;
}

export const AddNoteModal: FC<AddNoteModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
  getNotes,
}) => {
  const { t } = useTranslation();
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      const notes = await getNotes();
      setNote(notes);
    };
    fetchNotes();
  }, [getNotes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    onSubmit({
      note: note.trim(),
    });
  };

  const handleClose = () => {
    setNote('');
    onOpenChange(false);
  };

  return (
    <ModalComponent isOpen={isOpen} onOpenChange={handleClose}>
      <Heading slot="title" className={styles.title}>
        {t('BONSAI.COLLECTION.ADD_NOTE_MODAL.TITLE')}
      </Heading>
      <Text className={styles.description}>
        {t('BONSAI.COLLECTION.ADD_NOTE_MODAL.DESCRIPTION')}
      </Text>

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_NOTE_MODAL.NOTE_LABEL')}
          </Label>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.COLLECTION.ADD_NOTE_MODAL.NOTE_PLACEHOLDER')}
            disabled={isLoading}
            required
            rows={10}
          />
        </TextField>

        <div className={styles.actions}>
          <UIButton
            onPress={handleClose}
            variant="secondary"
            isDisabled={isLoading}
          >
            {t('BONSAI.COLLECTION.ADD_NOTE_MODAL.CANCEL')}
          </UIButton>
          <UIButton type="submit" variant="primary" isDisabled={isLoading}>
            {isLoading
              ? t('BONSAI.COLLECTION.ADD_NOTE_MODAL.UPDATING')
              : t('BONSAI.COLLECTION.ADD_NOTE_MODAL.UPDATE')}
          </UIButton>
        </div>
      </form>
    </ModalComponent>
  );
};
