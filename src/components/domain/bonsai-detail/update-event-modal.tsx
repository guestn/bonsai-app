import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text, TextField, Input, Label } from 'react-aria-components';
import { BonsaiTree, BonsaiEvent } from '../../../types/bonsai';
import { ModalComponent, Button } from '../../../components/ui';
import { Select } from '../../../components/ui/select';
import styles from './add-event-modal.module.scss'; // Reusing the same styles

interface UpdateEventModalProps {
  tree: BonsaiTree;
  event: BonsaiEvent;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (event: {
    description: string;
    date: string;
    cost?: number;
    status?: 'active' | 'expired';
  }) => void;
  isLoading?: boolean;
}

export const UpdateEventModal: FC<UpdateEventModalProps> = ({
  tree,
  event,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'active' | 'expired'>(tree.status);

  // Initialize form with event data when modal opens
  useEffect(() => {
    if (isOpen && event) {
      setDescription(event.description);
      setDate(event.date);
      setCost(event.cost?.toString() || '');
      setStatus(tree.status);
    }
  }, [isOpen, event, tree.status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !date) return;

    onSubmit({
      description: description.trim(),
      date,
      cost: cost ? parseFloat(cost) : undefined,
      status,
    });
  };

  const handleClose = () => {
    setDescription('');
    setDate('');
    setCost('');
    setStatus(tree.status);
    onOpenChange(false);
  };

  const statusOptions = [
    { id: 'active', label: t('BONSAI.COLLECTION.STATUSES.ACTIVE') },
    { id: 'expired', label: t('BONSAI.COLLECTION.STATUSES.EXPIRED') },
  ];

  return (
    <ModalComponent isOpen={isOpen} onOpenChange={handleClose}>
      <Heading slot="title" className={styles.title}>
        {t('BONSAI.DETAIL.UPDATE_MODAL.TITLE')}
      </Heading>
      <Text className={styles.description}>
        {t('BONSAI.DETAIL.UPDATE_MODAL.DESCRIPTION', {
          treeName: tree.name,
          eventDescription: event.description,
        })}
      </Text>

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.UPDATE_MODAL.DESCRIPTION_LABEL')}
          </Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.input}
            placeholder={t(
              'BONSAI.DETAIL.UPDATE_MODAL.DESCRIPTION_PLACEHOLDER',
            )}
            disabled={isLoading}
            required
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.UPDATE_MODAL.DATE_LABEL')}
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

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.UPDATE_MODAL.COST_LABEL')}
          </Label>
          <Input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.DETAIL.UPDATE_MODAL.COST_PLACEHOLDER')}
            disabled={isLoading}
            step="0.01"
            min="0"
          />
        </TextField>

        <Select
          selectedKey={status}
          onSelectionChange={(key) => setStatus(key as 'active' | 'expired')}
          className={styles.field}
          label={t('BONSAI.COLLECTION.STATUS')}
          items={statusOptions}
          isDisabled={isLoading}
        />

        <div className={styles.actions}>
          <Button
            onPress={handleClose}
            isDisabled={isLoading}
            variant="secondary"
          >
            {t('BONSAI.DETAIL.UPDATE_MODAL.CANCEL')}
          </Button>
          <Button
            type="submit"
            isDisabled={isLoading || !description.trim() || !date}
            variant="primary"
          >
            {isLoading
              ? t('BONSAI.DETAIL.UPDATE_MODAL.UPDATING')
              : t('BONSAI.DETAIL.UPDATE_MODAL.UPDATE')}
          </Button>
        </div>
      </form>
    </ModalComponent>
  );
};
