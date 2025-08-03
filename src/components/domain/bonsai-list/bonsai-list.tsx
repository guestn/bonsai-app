import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Heading,
  Text,
} from 'react-aria-components';
import { Button, Chip } from '../../ui';
import { BonsaiFilters, BonsaiTree } from '../../../types/bonsai';
import { useBonsai, useBonsaiMutations } from '../../../hooks/use-bonsai';
import { useAuth } from '../../../context/auth-provider';
import {
  formatCurrency,
  formatDate,
  formatAge,
} from '../../../utils/formatters';
import { AddBonsaiModal } from './add-bonsai-modal';
import { BonsaiFiltersComponent } from './bonsai-filters';
import styles from './bonsai-list.module.scss';

export const BonsaiList: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bonsai, isLoading, error } = useBonsai();
  const { createBonsai } = useBonsaiMutations();
  const { isAuthorized } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingBonsai, setIsAddingBonsai] = useState(false);
  const [filters, setFilters] = useState<BonsaiFilters>({
    search: '',
    status: 'active', // Set active as default
    type: '',
    species: '',
    dateRange: { start: '', end: '' },
  });

  const [filteredData, setFilteredData] = useState<BonsaiTree[]>([]);

  const handleAddBonsai = async (treeData: {
    name: string;
    species: string;
    status: 'active' | 'expired';
    type: 'purchased' | 'collected' | 'field';
    initialCost: number;
    acquisitionDate: string;
    location?: string;
    potType?: string;
    notes?: string;
  }) => {
    try {
      setIsAddingBonsai(true);
      await createBonsai({
        ...treeData,
        events: [],
        images: [],
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding bonsai:', error);
      alert(t('BONSAI.COLLECTION.ERROR_ADDING_BONSAI'));
    } finally {
      setIsAddingBonsai(false);
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <Text>
            {t('BONSAI.COLLECTION.ERROR', { message: error.message })}
          </Text>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Text>{t('BONSAI.COLLECTION.LOADING')}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Heading level={1}>{t('BONSAI.COLLECTION.TITLE')}</Heading>
          <Button
            onPress={() => setIsAddModalOpen(true)}
            variant="primary"
            className={styles.addButton}
            isDisabled={!isAuthorized}
          >
            {t('BONSAI.COLLECTION.ADD_TREE')}
          </Button>
        </div>
        <div className={styles.body}>
          {/* Filters */}
          <BonsaiFiltersComponent
            bonsai={bonsai}
            filters={filters}
            onFiltersChange={setFilters}
            onFilteredDataChange={setFilteredData}
          />

          {/* Desktop Table */}
          <div className={styles.tableWrapper}>
            <Table aria-label="Bonsai trees" className={styles.table}>
              <TableHeader>
                <Column isRowHeader defaultWidth="2fr">
                  {t('BONSAI.COLLECTION.TABLE.NAME')}
                </Column>
                <Column defaultWidth="1.5fr">
                  {t('BONSAI.COLLECTION.TABLE.SPECIES')}
                </Column>
                <Column defaultWidth="0.8fr">
                  {t('BONSAI.COLLECTION.TABLE.STATUS')}
                </Column>
                <Column defaultWidth="0.8fr">
                  {t('BONSAI.COLLECTION.TYPE')}
                </Column>
                <Column defaultWidth="1fr">
                  {t('BONSAI.COLLECTION.TABLE.COST')}
                </Column>
                <Column defaultWidth="1fr">
                  {t('BONSAI.COLLECTION.TABLE.ACQUIRED')}
                </Column>
                <Column defaultWidth="1fr">
                  {t('BONSAI.COLLECTION.TABLE.AGE')}
                </Column>
                <Column defaultWidth="1fr">
                  {t('BONSAI.COLLECTION.TABLE.ACTIONS')}
                </Column>
              </TableHeader>
              <TableBody items={filteredData}>
                {(tree) => (
                  <Row key={tree.id}>
                    <Cell>
                      <div className={styles.treeName}>
                        <strong>{tree.name}</strong>
                        {tree.notes && (
                          <div className={styles.notes}>{tree.notes}</div>
                        )}
                      </div>
                    </Cell>
                    <Cell>{tree.species}</Cell>
                    <Cell>
                      <Chip
                        label={t(
                          `BONSAI.COLLECTION.STATUSES.${tree.status.toUpperCase()}`,
                        )}
                        variant={tree.status}
                        size="sm"
                      />
                    </Cell>
                    <Cell>
                      <Chip
                        label={t(
                          `BONSAI.COLLECTION.TYPES.${(tree.type || 'purchased').toUpperCase()}`,
                        )}
                        variant={tree.type || 'purchased'}
                        size="sm"
                      />
                    </Cell>
                    <Cell>{formatCurrency(tree.initialCost)}</Cell>
                    <Cell>{formatDate(tree.acquisitionDate)}</Cell>
                    <Cell>{formatAge(tree.age || 0, t)}</Cell>
                    <Cell>
                      <Button
                        onPress={() => {
                          console.info(
                            'Navigating to tree:',
                            tree.id,
                            tree.name,
                          );
                          navigate(`/${tree.id}`);
                        }}
                        className={styles.viewButton}
                      >
                        {t('BONSAI.COLLECTION.TABLE.VIEW_DETAILS')}
                      </Button>
                    </Cell>
                  </Row>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Layout */}
          <div className={styles.mobileCards}>
            {filteredData.map((tree) => (
              <div key={tree.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div className={styles.mobileCardTitle}>
                    <strong>{tree.name}</strong>
                    {tree.notes && (
                      <div className={styles.mobileCardNotes}>{tree.notes}</div>
                    )}
                  </div>
                  <div className={styles.mobileCardChips}>
                    <Chip
                      label={t(
                        `BONSAI.COLLECTION.STATUSES.${tree.status.toUpperCase()}`,
                      )}
                      variant={tree.status}
                      size="sm"
                    />
                    <Chip
                      label={t(
                        `BONSAI.COLLECTION.TYPES.${(tree.type || 'purchased').toUpperCase()}`,
                      )}
                      variant={tree.type || 'purchased'}
                      size="sm"
                    />
                  </div>
                </div>
                <div className={styles.mobileCardDetails}>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>
                      {t('BONSAI.COLLECTION.TABLE.SPECIES')}:
                    </span>
                    <span>{tree.species}</span>
                  </div>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>
                      {t('BONSAI.COLLECTION.TABLE.COST')}:
                    </span>
                    <span>{formatCurrency(tree.initialCost)}</span>
                  </div>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>
                      {t('BONSAI.COLLECTION.TABLE.ACQUIRED')}:
                    </span>
                    <span>{formatDate(tree.acquisitionDate)}</span>
                  </div>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>
                      {t('BONSAI.COLLECTION.TABLE.AGE')}:
                    </span>
                    <span>{formatAge(tree.age || 0, t)}</span>
                  </div>
                </div>
                <div className={styles.mobileCardActions}>
                  <Button
                    onPress={() => {
                      console.info('Navigating to tree:', tree.id, tree.name);
                      navigate(`/${tree.id}`);
                    }}
                    className={styles.mobileViewButton}
                  >
                    {t('BONSAI.COLLECTION.TABLE.VIEW_DETAILS')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AddBonsaiModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddBonsai}
        isLoading={isAddingBonsai}
      />
    </div>
  );
};
