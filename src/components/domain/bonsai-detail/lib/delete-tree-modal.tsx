import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Heading, Text } from 'react-aria-components';
import { BonsaiTree } from '@/types/bonsai';
import { ModalComponent, Button } from '@/components/ui';
import styles from './delete-tree-modal.module.scss';

interface DeleteTreeModalProps {
  tree: BonsaiTree;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteTreeModal: FC<DeleteTreeModalProps> = ({
  tree,
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
        {t('BONSAI.DETAIL.DELETE_TREE_MODAL.TITLE')}
      </Heading>
      <Text className={styles.description}>
        {t('BONSAI.DETAIL.DELETE_TREE_MODAL.DESCRIPTION', {
          treeName: tree.name,
        })}
      </Text>
      <div className={styles.actions}>
        <Button
          onPress={() => onOpenChange(false)}
          isDisabled={isLoading}
          variant="secondary"
        >
          {t('BONSAI.DETAIL.DELETE_TREE_MODAL.CANCEL')}
        </Button>
        <Button onPress={handleConfirm} isDisabled={isLoading} variant="danger">
          {isLoading
            ? t('BONSAI.DETAIL.DELETE_TREE_MODAL.DELETING')
            : t('BONSAI.DETAIL.DELETE_TREE_MODAL.DELETE')}
        </Button>
      </div>
    </ModalComponent>
  );
};
