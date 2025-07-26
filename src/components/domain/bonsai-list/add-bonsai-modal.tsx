import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text, TextField, Input, Label } from 'react-aria-components';
import { ModalComponent, Button as UIButton, Select } from '../../ui';
import styles from './add-bonsai-modal.module.scss';

interface AddBonsaiModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (tree: {
    name: string;
    species: string;
    status: 'active' | 'expired';
    type: 'purchased' | 'collected' | 'field';
    initialCost: number;
    acquisitionDate: string;
    location?: string;
    potType?: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export const AddBonsaiModal: FC<AddBonsaiModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [status, setStatus] = useState<'active' | 'expired'>('active');
  const [type, setType] = useState<'purchased' | 'collected' | 'field'>(
    'purchased',
  );
  const [initialCost, setInitialCost] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [location, setLocation] = useState('');
  const [potType, setPotType] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !species.trim() || !acquisitionDate) return;

    onSubmit({
      name: name.trim(),
      species: species.trim(),
      status,
      type,
      initialCost: initialCost ? parseFloat(initialCost) : 0,
      acquisitionDate,
      location: location.trim() || undefined,
      potType: potType.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleClose = () => {
    setName('');
    setSpecies('');
    setStatus('active');
    setType('purchased');
    setInitialCost('');
    setAcquisitionDate('');
    setLocation('');
    setPotType('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <ModalComponent isOpen={isOpen} onOpenChange={handleClose}>
      <Heading slot="title" className={styles.title}>
        {t('BONSAI.COLLECTION.ADD_MODAL.TITLE')}
      </Heading>
      <Text className={styles.description}>
        {t('BONSAI.COLLECTION.ADD_MODAL.DESCRIPTION')}
      </Text>

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_MODAL.NAME_LABEL')}
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.COLLECTION.ADD_MODAL.NAME_PLACEHOLDER')}
            disabled={isLoading}
            required
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_MODAL.SPECIES_LABEL')}
          </Label>
          <Input
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.COLLECTION.ADD_MODAL.SPECIES_PLACEHOLDER')}
            disabled={isLoading}
            required
          />
        </TextField>

        <Select
          selectedKey={status}
          onSelectionChange={(key) => setStatus(key as 'active' | 'expired')}
          className={styles.field}
          isDisabled={isLoading}
          label={t('BONSAI.COLLECTION.ADD_MODAL.STATUS_LABEL')}
          items={[
            { id: 'active', label: t('BONSAI.COLLECTION.STATUSES.ACTIVE') },
            { id: 'expired', label: t('BONSAI.COLLECTION.STATUSES.EXPIRED') },
          ]}
        />

        <Select
          selectedKey={type}
          onSelectionChange={(key) =>
            setType(key as 'purchased' | 'collected' | 'field')
          }
          className={styles.field}
          isDisabled={isLoading}
          label={t('BONSAI.COLLECTION.ADD_MODAL.TYPE_LABEL')}
          items={[
            { id: 'purchased', label: t('BONSAI.COLLECTION.TYPES.PURCHASED') },
            { id: 'collected', label: t('BONSAI.COLLECTION.TYPES.COLLECTED') },
            { id: 'field', label: t('BONSAI.COLLECTION.TYPES.FIELD') },
          ]}
        />

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_MODAL.COST_LABEL')}
          </Label>
          <Input
            type="number"
            value={initialCost}
            onChange={(e) => setInitialCost(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.COLLECTION.ADD_MODAL.COST_PLACEHOLDER')}
            disabled={isLoading}
            step="0.01"
            min="0"
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_MODAL.ACQUISITION_DATE_LABEL')}
          </Label>
          <Input
            type="date"
            value={acquisitionDate}
            onChange={(e) => setAcquisitionDate(e.target.value)}
            className={styles.input}
            disabled={isLoading}
            required
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_MODAL.LOCATION_LABEL')}
          </Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.COLLECTION.ADD_MODAL.LOCATION_PLACEHOLDER')}
            disabled={isLoading}
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_MODAL.POT_TYPE_LABEL')}
          </Label>
          <Input
            value={potType}
            onChange={(e) => setPotType(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.COLLECTION.ADD_MODAL.POT_TYPE_PLACEHOLDER')}
            disabled={isLoading}
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.COLLECTION.ADD_MODAL.NOTES_LABEL')}
          </Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.COLLECTION.ADD_MODAL.NOTES_PLACEHOLDER')}
            disabled={isLoading}
          />
        </TextField>

        <div className={styles.actions}>
          <UIButton
            onPress={handleClose}
            variant="secondary"
            isDisabled={isLoading}
          >
            {t('BONSAI.COLLECTION.ADD_MODAL.CANCEL')}
          </UIButton>
          <UIButton type="submit" variant="primary" isDisabled={isLoading}>
            {isLoading
              ? t('BONSAI.COLLECTION.ADD_MODAL.ADDING')
              : t('BONSAI.COLLECTION.ADD_MODAL.ADD')}
          </UIButton>
        </div>
      </form>
    </ModalComponent>
  );
};
