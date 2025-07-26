import { FC, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  TextField,
  Label,
  Heading,
  Text,
} from 'react-aria-components';
import { Button, Select, Chip } from '../../ui';
import { BonsaiTree, BonsaiFilters } from '../../../types/bonsai';
import { useBonsai, useBonsaiMutations } from '../../../hooks/use-bonsai';
import { useAuth } from '../../../context/auth-provider';
import {
  formatCurrency,
  formatDate,
  formatAge,
} from '../../../utils/formatters';
import { AddBonsaiModal } from './add-bonsai-modal';
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
    status: '',
    species: '',
    dateRange: { start: '', end: '' },
  });

  // Get unique species for filter
  const uniqueSpecies = useMemo(() => {
    if (!bonsai || !Array.isArray(bonsai)) return [];
    const species = bonsai.map((tree) => tree.species);
    return Array.from(new Set(species));
  }, [bonsai]);

  const handleAddBonsai = async (treeData: {
    name: string;
    species: string;
    status: 'active' | 'dormant' | 'flowering' | 'repotted';
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

  // Filter data
  const filteredData = useMemo(() => {
    if (!bonsai || !Array.isArray(bonsai)) return [];
    return bonsai.filter((tree) => {
      const matchesSearch =
        !filters.search ||
        tree.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tree.species.toLowerCase().includes(filters.search.toLowerCase()) ||
        tree.notes?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || tree.status === filters.status;
      const matchesSpecies =
        !filters.species || tree.species === filters.species;

      const matchesDateRange =
        !filters.dateRange.start ||
        !filters.dateRange.end ||
        (tree.acquisitionDate >= filters.dateRange.start &&
          tree.acquisitionDate <= filters.dateRange.end);

      return (
        matchesSearch && matchesStatus && matchesSpecies && matchesDateRange
      );
    });
  }, [bonsai, filters]);

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
          <div className={styles.filters}>
            <TextField
              value={filters.search}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, search: value }))
              }
              className={styles.searchField}
            >
              <Label>{t('BONSAI.COLLECTION.SEARCH')}</Label>
            </TextField>

            <Select
              selectedKey={filters.status}
              onSelectionChange={(key) =>
                setFilters((prev) => ({ ...prev, status: key as string }))
              }
              className={styles.select}
              label={t('BONSAI.COLLECTION.STATUS')}
              items={[
                { id: '', label: t('BONSAI.COLLECTION.ALL_STATUSES') },
                { id: 'active', label: t('BONSAI.COLLECTION.STATUSES.ACTIVE') },
                {
                  id: 'dormant',
                  label: t('BONSAI.COLLECTION.STATUSES.DORMANT'),
                },
                {
                  id: 'flowering',
                  label: t('BONSAI.COLLECTION.STATUSES.FLOWERING'),
                },
                {
                  id: 'repotted',
                  label: t('BONSAI.COLLECTION.STATUSES.REPOTTED'),
                },
              ]}
            />

            <Select
              selectedKey={filters.species}
              onSelectionChange={(key) =>
                setFilters((prev) => ({ ...prev, species: key as string }))
              }
              className={styles.select}
              label={t('BONSAI.COLLECTION.SPECIES')}
              items={[
                { id: '', label: t('BONSAI.COLLECTION.ALL_SPECIES') },
                ...(uniqueSpecies?.map((species) => ({
                  id: species,
                  label: species,
                })) || []),
              ]}
            />
          </div>

          {/* Results count */}
          <div className={styles.resultsCount}>
            {t('BONSAI.COLLECTION.RESULTS_COUNT', {
              count: filteredData.length,
              plural: filteredData.length !== 1 ? 's' : '',
            })}
          </div>

          {/* Table */}
          <Table aria-label="Bonsai trees" className={styles.table}>
            <TableHeader>
              <Column isRowHeader defaultWidth="2fr">
                {t('BONSAI.COLLECTION.TABLE.NAME')}
              </Column>
              <Column defaultWidth="2fr">
                {t('BONSAI.COLLECTION.TABLE.SPECIES')}
              </Column>
              <Column defaultWidth="1fr">
                {t('BONSAI.COLLECTION.TABLE.STATUS')}
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
                  <Cell>{formatCurrency(tree.initialCost)}</Cell>
                  <Cell>{formatDate(tree.acquisitionDate)}</Cell>
                  <Cell>{formatAge(tree.age || 0, t)}</Cell>
                  <Cell>
                    <Button
                      onPress={() => {
                        console.info('Navigating to tree:', tree.id, tree.name);
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
