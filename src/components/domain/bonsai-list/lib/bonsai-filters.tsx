import { FC, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Label, Input } from 'react-aria-components';
import { Select } from '../../../ui/select';
import { BonsaiFilters, BonsaiTree } from '../../../../types/bonsai';
import styles from '../bonsai-list.module.scss';

interface BonsaiFiltersProps {
  bonsai: BonsaiTree[];
  filters: BonsaiFilters;
  onFiltersChange: (filters: BonsaiFilters) => void;
  onFilteredDataChange: (filteredData: BonsaiTree[]) => void;
}

export const BonsaiFiltersComponent: FC<BonsaiFiltersProps> = ({
  bonsai,
  filters,
  onFiltersChange,
  onFilteredDataChange,
}) => {
  const { t } = useTranslation();

  // Get unique species for filter
  const uniqueSpecies = useMemo(() => {
    if (!bonsai || !Array.isArray(bonsai)) return [];
    const species = bonsai.map((tree) => tree.species);
    return Array.from(new Set(species));
  }, [bonsai]);

  const filteredData = useMemo(() => {
    if (!bonsai || !Array.isArray(bonsai)) return [];

    return bonsai.filter((tree) => {
      const matchesSearch =
        !filters.search ||
        tree.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tree.species.toLowerCase().includes(filters.search.toLowerCase()) ||
        tree.notes?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || tree.status === filters.status;
      const matchesType = !filters.type || tree.type === filters.type;
      const matchesSpecies =
        !filters.species || tree.species === filters.species;

      const matchesDateRange =
        !filters.dateRange.start ||
        !filters.dateRange.end ||
        (tree.acquisitionDate >= filters.dateRange.start &&
          tree.acquisitionDate <= filters.dateRange.end);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesSpecies &&
        matchesDateRange
      );
    });
  }, [bonsai, filters]);

  useEffect(() => {
    onFilteredDataChange(filteredData);
  }, [filteredData, onFilteredDataChange]);

  return (
    <div className={styles.filters}>
      <TextField
        value={filters.search}
        onChange={(value) => onFiltersChange({ ...filters, search: value })}
        className={styles.searchField}
      >
        <Label>{t('BONSAI.COLLECTION.SEARCH')}</Label>
        <Input
          placeholder={t('BONSAI.COLLECTION.SEARCH_PLACEHOLDER')}
          className={styles.searchInput}
        />
      </TextField>

      <Select
        selectedKey={filters.status}
        onSelectionChange={(key) =>
          onFiltersChange({ ...filters, status: key as string })
        }
        className={styles.select}
        label={t('BONSAI.COLLECTION.STATUS')}
        items={[
          { id: '', label: t('BONSAI.COLLECTION.ALL_STATUSES') },
          { id: 'active', label: t('BONSAI.COLLECTION.STATUSES.ACTIVE') },
          {
            id: 'expired',
            label: t('BONSAI.COLLECTION.STATUSES.EXPIRED'),
          },
        ]}
      />

      <Select
        selectedKey={filters.type}
        onSelectionChange={(key) => {
          onFiltersChange({ ...filters, type: key as string });
        }}
        className={styles.select}
        label={t('BONSAI.COLLECTION.TYPE')}
        items={[
          { id: '', label: t('BONSAI.COLLECTION.ALL_TYPES') },
          {
            id: 'purchased',
            label: t('BONSAI.COLLECTION.TYPES.PURCHASED'),
          },
          {
            id: 'collected',
            label: t('BONSAI.COLLECTION.TYPES.COLLECTED'),
          },
          { id: 'field', label: t('BONSAI.COLLECTION.TYPES.FIELD') },
        ]}
      />

      <Select
        selectedKey={filters.species}
        onSelectionChange={(key) =>
          onFiltersChange({ ...filters, species: key as string })
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

      {/* Results count */}
      <div className={styles.resultsCount}>
        {t('BONSAI.COLLECTION.RESULTS_COUNT', {
          count: filteredData.length,
          plural: filteredData.length !== 1 ? 's' : '',
        })}
      </div>
    </div>
  );
};
