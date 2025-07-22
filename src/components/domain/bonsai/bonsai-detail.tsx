import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Heading,
  Text,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
} from 'react-aria-components';
import { BonsaiTree } from '../../../types/bonsai';
import {
  formatCurrency,
  formatDate,
  getTimeAgo,
  formatAge,
} from '../../../utils/formatters';
import styles from './bonsai-detail.module.scss';

interface BonsaiDetailProps {
  tree: BonsaiTree;
  onBack: () => void;
}

export const BonsaiDetail: FC<BonsaiDetailProps> = ({ tree, onBack }) => {
  const { t } = useTranslation();

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

  const sortedEvents = [...tree.events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button onPress={onBack} className={styles.backButton}>
          {t('BONSAI.DETAIL.BACK_TO_COLLECTION')}
        </Button>
        <Heading level={1}>{tree.name}</Heading>
        <Text className={styles.species}>{tree.species}</Text>
      </div>

      <div className={styles.content}>
        {/* Main Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Heading level={2}>{t('BONSAI.DETAIL.TREE_INFORMATION')}</Heading>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Text className={styles.label}>
                  {t('BONSAI.DETAIL.LABELS.STATUS')}
                </Text>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(tree.status) }}
                >
                  {t(`BONSAI.COLLECTION.STATUSES.${tree.status.toUpperCase()}`)}
                </span>
              </div>

              <div className={styles.infoItem}>
                <Text className={styles.label}>
                  {t('BONSAI.DETAIL.LABELS.INITIAL_COST')}
                </Text>
                <Text className={styles.value}>
                  {formatCurrency(tree.initialCost)}
                </Text>
              </div>

              <div className={styles.infoItem}>
                <Text className={styles.label}>
                  {t('BONSAI.DETAIL.LABELS.ACQUISITION_DATE')}
                </Text>
                <Text className={styles.value}>
                  {formatDate(tree.acquisitionDate)}
                </Text>
              </div>

              <div className={styles.infoItem}>
                <Text className={styles.label}>
                  {t('BONSAI.DETAIL.LABELS.AGE')}
                </Text>
                <Text className={styles.value}>
                  {formatAge(tree.age || 0, t)}
                </Text>
              </div>

              {tree.location && (
                <div className={styles.infoItem}>
                  <Text className={styles.label}>
                    {t('BONSAI.DETAIL.LABELS.LOCATION')}
                  </Text>
                  <Text className={styles.value}>{tree.location}</Text>
                </div>
              )}

              {tree.potType && (
                <div className={styles.infoItem}>
                  <Text className={styles.label}>
                    {t('BONSAI.DETAIL.LABELS.POT_TYPE')}
                  </Text>
                  <Text className={styles.value}>{tree.potType}</Text>
                </div>
              )}
            </div>

            {tree.notes && (
              <div className={styles.notes}>
                <Text className={styles.label}>
                  {t('BONSAI.DETAIL.LABELS.NOTES')}
                </Text>
                <Text className={styles.notesText}>{tree.notes}</Text>
              </div>
            )}
          </div>
        </div>

        {/* Events Timeline */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Heading level={2}>{t('BONSAI.DETAIL.CARE_HISTORY')}</Heading>
          </div>
          <div className={styles.cardBody}>
            <Table
              aria-label="Bonsai care events"
              className={styles.eventsTable}
            >
              <TableHeader>
                <Column isRowHeader>
                  {t('BONSAI.DETAIL.EVENTS_TABLE.EVENT')}
                </Column>
                <Column>{t('BONSAI.DETAIL.EVENTS_TABLE.WHEN')}</Column>
                <Column>{t('BONSAI.DETAIL.EVENTS_TABLE.COST')}</Column>
              </TableHeader>
              <TableBody items={sortedEvents}>
                {(event) => (
                  <Row key={event.id}>
                    <Cell>
                      <Text className={styles.eventDescription}>
                        {event.description}
                      </Text>
                    </Cell>
                    <Cell>
                      <div className={styles.eventTime}>
                        <Text className={styles.eventTimeAgo}>
                          {getTimeAgo(event.date, t)}
                        </Text>
                        <Text className={styles.eventDate}>
                          {formatDate(event.date)}
                        </Text>
                      </div>
                    </Cell>
                    <Cell>
                      {event.cost && (
                        <Text className={styles.eventCost}>
                          {formatCurrency(event.cost)}
                        </Text>
                      )}
                    </Cell>
                  </Row>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Images Section */}
        {tree.images && tree.images.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Heading level={2}>{t('BONSAI.DETAIL.IMAGES')}</Heading>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.imagesGrid}>
                {[...(tree.images || [])].reverse().map((image, index) => (
                  <div key={index} className={styles.imageContainer}>
                    <img
                      src={image}
                      alt={t('BONSAI.DETAIL.IMAGE_ALT', {
                        treeName: tree.name,
                        imageNumber: (tree.images?.length || 0) - index,
                      })}
                      className={styles.image}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
