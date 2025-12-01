import { FC, useMemo } from 'react';
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
  Checkbox,
} from 'react-aria-components';
import { Button, Chip } from '../../components/ui';
import { useBonsai } from '../../hooks/use-bonsai';
import { useRepotList } from '../../hooks/use-repot-list';
import { formatCurrency, formatDate, formatAge } from '../../utils/formatters';
import styles from './repot-list-page.module.scss';

export const RepotListPage: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bonsai, isLoading, error } = useBonsai();
  const {
    repotList,
    isInRepotList,
    clearRepotList,
    addToRepotList,
    removeFromRepotList,
  } = useRepotList();

  const repotListTrees = useMemo(() => {
    if (!bonsai || !repotList.length) return [];
    return bonsai.filter((tree) => repotList.includes(tree.id));
  }, [bonsai, repotList]);

  const handleBack = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <Text>
            {t('BONSAI.REPOT_LIST.ERROR', { message: error.message })}
          </Text>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Text>{t('BONSAI.REPOT_LIST.LOADING')}</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Heading level={1}>{t('BONSAI.REPOT_LIST.TITLE')}</Heading>
          <div className={styles.headerActions}>
            {repotList.length > 0 && (
              <Button
                onPress={async () => {
                  try {
                    await clearRepotList();
                  } catch (error) {
                    console.error('Error clearing repot list:', error);
                  }
                }}
                variant="danger"
                className={styles.clearButton}
              >
                {t('BONSAI.REPOT_LIST.CLEAR_LIST')}
              </Button>
            )}
            <Button
              onPress={handleBack}
              variant="secondary"
              className={styles.backButton}
            >
              {t('BONSAI.REPOT_LIST.BACK_TO_COLLECTION')}
            </Button>
          </div>
        </div>
        <div className={styles.body}>
          {repotListTrees.length === 0 ? (
            <div className={styles.emptyState}>
              <Text>{t('BONSAI.REPOT_LIST.EMPTY')}</Text>
              <Button onPress={handleBack} variant="primary">
                {t('BONSAI.REPOT_LIST.BACK_TO_COLLECTION')}
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.count}>
                {t('BONSAI.REPOT_LIST.COUNT', {
                  count: repotListTrees.length,
                })}
              </div>
              <div className={styles.tableWrapper}>
                <Table aria-label="Repot list" className={styles.table}>
                  <TableHeader>
                    <Column isRowHeader defaultWidth="8fr">
                      {t('BONSAI.COLLECTION.TABLE.NAME')}
                    </Column>
                    <Column defaultWidth="1.5fr">
                      {t('BONSAI.COLLECTION.TABLE.SPECIES')}
                    </Column>
                    <Column defaultWidth="0.8fr">
                      {t('BONSAI.COLLECTION.TABLE.STATUS')}
                    </Column>
                    <Column defaultWidth="0.8fr">
                      {t('BONSAI.COLLECTION.TABLE.TYPE')}
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
                    <Column defaultWidth="0.5fr">
                      {t('BONSAI.COLLECTION.TABLE.REPOT')}
                    </Column>
                  </TableHeader>
                  <TableBody items={repotListTrees}>
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
                              navigate(`/${tree.id}`);
                            }}
                            className={styles.viewButton}
                          >
                            {t('BONSAI.COLLECTION.TABLE.VIEW_DETAILS')}
                          </Button>
                        </Cell>
                        <Cell>
                          <Checkbox
                            className={styles.repotCheckbox}
                            isSelected={isInRepotList(tree.id)}
                            onChange={async (isSelected) => {
                              try {
                                if (isSelected) {
                                  await addToRepotList(tree.id);
                                } else {
                                  await removeFromRepotList(tree.id);
                                }
                              } catch (error) {
                                console.error(
                                  'Error updating repot list:',
                                  error,
                                );
                              }
                            }}
                            aria-label={t(
                              'BONSAI.COLLECTION.TABLE.ADD_TO_REPOT_LIST',
                              {
                                treeName: tree.name,
                              },
                            )}
                          >
                            <span slot="indicator" aria-hidden="true" />
                          </Checkbox>
                        </Cell>
                      </Row>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Layout */}
              <div className={styles.mobileCards}>
                {repotListTrees.map((tree) => (
                  <div key={tree.id} className={styles.mobileCard}>
                    <div className={styles.mobileCardHeader}>
                      <div className={styles.mobileCardTitle}>
                        <div
                          className={styles.mobileRepotCheckbox}
                          data-selected={
                            isInRepotList(tree.id) ? 'true' : 'false'
                          }
                        >
                          <Checkbox
                            isSelected={isInRepotList(tree.id)}
                            onChange={async (isSelected) => {
                              try {
                                if (isSelected) {
                                  await addToRepotList(tree.id);
                                } else {
                                  await removeFromRepotList(tree.id);
                                }
                              } catch (error) {
                                console.error(
                                  'Error updating repot list:',
                                  error,
                                );
                              }
                            }}
                            aria-label={t(
                              'BONSAI.COLLECTION.TABLE.ADD_TO_REPOT_LIST',
                              {
                                treeName: tree.name,
                              },
                            )}
                          >
                            <span
                              className={styles.checkboxIcon}
                              aria-hidden="true"
                            />
                          </Checkbox>
                        </div>
                        <div>
                          <strong>{tree.name}</strong>
                          {tree.notes && (
                            <div className={styles.mobileCardNotes}>
                              {tree.notes}
                            </div>
                          )}
                        </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
