import { FC, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Button,
  TextField,
  Select,
  SelectValue,
  ComboBox,
  ListBox,
  ListBoxItem,
  Label,
  Heading,
} from 'react-aria-components';
import { BonsaiTree, BonsaiFilters } from '../../../types/bonsai';
import { mockBonsaiData } from '../../../data/mock-bonsai-data';
import styles from './bonsai-list.module.scss';

export const BonsaiList: FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<BonsaiFilters>({
    search: '',
    status: '',
    species: '',
    dateRange: { start: '', end: '' },
  });

  // Get unique species for filter
  const uniqueSpecies = useMemo(() => {
    const species = mockBonsaiData.map((tree) => tree.species);
    return Array.from(new Set(species));
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    return mockBonsaiData.filter((tree) => {
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
  }, [filters]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: BonsaiTree['status']) => {
    switch (status) {
      case 'active':
        return 'var(--color-success)';
      case 'flowering':
        return 'var(--color-accent)';
      case 'dormant':
        return 'var(--color-gray-500)';
      case 'repotted':
        return 'var(--color-info)';
      default:
        return 'var(--color-gray-500)';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Heading level={1}>Bonsai Collection</Heading>
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
              <Label>Search</Label>
            </TextField>

            <Select
              selectedKey={filters.status}
              onSelectionChange={(key) =>
                setFilters((prev) => ({ ...prev, status: key as string }))
              }
              className={styles.select}
            >
              <Label>Status</Label>
              <Button>
                <SelectValue />
              </Button>
              <ListBox>
                <ListBoxItem key="">All Statuses</ListBoxItem>
                <ListBoxItem key="active">Active</ListBoxItem>
                <ListBoxItem key="dormant">Dormant</ListBoxItem>
                <ListBoxItem key="flowering">Flowering</ListBoxItem>
                <ListBoxItem key="repotted">Repotted</ListBoxItem>
              </ListBox>
            </Select>

            <ComboBox
              selectedKey={filters.species}
              onSelectionChange={(key) =>
                setFilters((prev) => ({ ...prev, species: key as string }))
              }
              className={styles.select}
            >
              <Label>Species</Label>
              <ListBox>
                <ListBoxItem key="">All Species</ListBoxItem>
                {uniqueSpecies.map((species) => (
                  <ListBoxItem key={species}>{species}</ListBoxItem>
                ))}
              </ListBox>
            </ComboBox>
          </div>

          {/* Results count */}
          <div className={styles.resultsCount}>
            {filteredData.length} tree
            {filteredData.length !== 1 ? 's' : ''} found
          </div>

          {/* Table */}
          <Table aria-label="Bonsai trees" className={styles.table}>
            <TableHeader>
              <Column isRowHeader defaultWidth="2fr">
                Name
              </Column>
              <Column defaultWidth="2fr">Species</Column>
              <Column defaultWidth="1fr">Status</Column>
              <Column defaultWidth="1fr">Cost</Column>
              <Column defaultWidth="1fr">Acquired</Column>
              <Column defaultWidth="1fr">Age</Column>
              <Column defaultWidth="1fr">Actions</Column>
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
                    <span
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(tree.status) }}
                    >
                      {tree.status}
                    </span>
                  </Cell>
                  <Cell>{formatCurrency(tree.initialCost)}</Cell>
                  <Cell>{formatDate(tree.acquisitionDate)}</Cell>
                  <Cell>
                    {tree.age} year{tree.age !== 1 ? 's' : ''}
                  </Cell>
                  <Cell>
                    <Button
                      onPress={() => {
                        navigate(`/${tree.id}`);
                      }}
                      className={styles.viewButton}
                    >
                      View Details
                    </Button>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
