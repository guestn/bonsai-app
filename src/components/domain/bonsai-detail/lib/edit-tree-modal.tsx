import { FC, useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text, TextField, Input, Label } from 'react-aria-components';
import { BonsaiTree } from '../../../../types/bonsai';
import { ModalComponent, Button, Select } from '../../../ui';
import styles from './add-event-modal.module.scss'; // Reusing the same styles

interface EditTreeModalProps {
  tree: BonsaiTree;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (treeData: {
    name: string;
    species: string;
    status: 'active' | 'expired';
    location?: string;
    potType?: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export const EditTreeModal: FC<EditTreeModalProps> = ({
  tree,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [status, setStatus] = useState<'active' | 'expired'>('active');
  const [location, setLocation] = useState('');
  const [potType, setPotType] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && tree) {
      setName(tree.name);
      setSpecies(tree.species);
      setStatus(tree.status);
      setLocation(tree.location || '');
      setPotType(tree.potType || '');
      setNotes(tree.notes || '');
    }
  }, [isOpen, tree]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !species.trim()) return;

    onSubmit({
      name: name.trim(),
      species: species.trim(),
      status,
      location: location.trim() || undefined,
      potType: potType.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleClose = () => {
    setName('');
    setSpecies('');
    setStatus('active');
    setLocation('');
    setPotType('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <ModalComponent isOpen={isOpen} onOpenChange={handleClose}>
      <Heading slot="title" className={styles.title}>
        {t('BONSAI.DETAIL.EDIT_TREE_MODAL.TITLE')}
      </Heading>
      <Text className={styles.description}>
        {t('BONSAI.DETAIL.EDIT_TREE_MODAL.DESCRIPTION', {
          treeName: tree.name,
        })}
      </Text>

      <form onSubmit={handleSubmit} className={styles.form}>
        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.EDIT_TREE_MODAL.NAME_LABEL')}
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.DETAIL.EDIT_TREE_MODAL.NAME_PLACEHOLDER')}
            disabled={isLoading}
            required
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.EDIT_TREE_MODAL.SPECIES_LABEL')}
          </Label>
          <Input
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.DETAIL.EDIT_TREE_MODAL.SPECIES_PLACEHOLDER')}
            disabled={isLoading}
            required
          />
        </TextField>

        <div className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.EDIT_TREE_MODAL.STATUS_LABEL')}
          </Label>
          <Select
            selectedKey={status}
            onSelectionChange={(key) => setStatus(key as 'active' | 'expired')}
            isDisabled={isLoading}
            className={styles.select}
            items={[
              {
                id: 'active',
                label: t('BONSAI.COLLECTION.STATUSES.ACTIVE'),
              },
              {
                id: 'expired',
                label: t('BONSAI.COLLECTION.STATUSES.EXPIRED'),
              },
            ]}
          />
        </div>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.EDIT_TREE_MODAL.LOCATION_LABEL')}
          </Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.input}
            placeholder={t(
              'BONSAI.DETAIL.EDIT_TREE_MODAL.LOCATION_PLACEHOLDER',
            )}
            disabled={isLoading}
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.EDIT_TREE_MODAL.POT_TYPE_LABEL')}
          </Label>
          <Input
            value={potType}
            onChange={(e) => setPotType(e.target.value)}
            className={styles.input}
            placeholder={t(
              'BONSAI.DETAIL.EDIT_TREE_MODAL.POT_TYPE_PLACEHOLDER',
            )}
            disabled={isLoading}
          />
        </TextField>

        <TextField className={styles.field}>
          <Label className={styles.label}>
            {t('BONSAI.DETAIL.EDIT_TREE_MODAL.NOTES_LABEL')}
          </Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.input}
            placeholder={t('BONSAI.DETAIL.EDIT_TREE_MODAL.NOTES_PLACEHOLDER')}
            disabled={isLoading}
          />
        </TextField>

        <div className={styles.actions}>
          <Button
            onPress={handleClose}
            isDisabled={isLoading}
            variant="secondary"
          >
            {t('BONSAI.DETAIL.EDIT_TREE_MODAL.CANCEL')}
          </Button>
          <Button
            type="submit"
            isDisabled={isLoading || !name.trim() || !species.trim()}
            variant="primary"
          >
            {isLoading
              ? t('BONSAI.DETAIL.EDIT_TREE_MODAL.UPDATING')
              : t('BONSAI.DETAIL.EDIT_TREE_MODAL.UPDATE')}
          </Button>
        </div>
      </form>
    </ModalComponent>
  );
};
