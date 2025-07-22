import { FC } from 'react';
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
import styles from './bonsai-detail.module.scss';

interface BonsaiDetailProps {
  tree: BonsaiTree;
  onBack: () => void;
}

export const BonsaiDetail: FC<BonsaiDetailProps> = ({ tree, onBack }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - eventDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      const remainingDays = diffInDays % 7;
      if (remainingDays === 0) {
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
      } else {
        return `${weeks} week${weeks === 1 ? '' : 's'} ${remainingDays} day${remainingDays === 1 ? '' : 's'} ago`;
      }
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      const remainingDays = diffInDays % 30;
      if (remainingDays === 0) {
        return `${months} month${months === 1 ? '' : 's'} ago`;
      } else {
        return `${months} month${months === 1 ? '' : 's'} ${remainingDays} day${remainingDays === 1 ? '' : 's'} ago`;
      }
    } else {
      const years = Math.floor(diffInDays / 365);
      const remainingDays = diffInDays % 365;
      const remainingMonths = Math.floor(remainingDays / 30);

      let result = `${years} year${years === 1 ? '' : 's'}`;

      if (remainingMonths > 0) {
        result += ` ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
      }

      return `${result} ago`;
    }
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

  const sortedEvents = [...tree.events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button onPress={onBack} className={styles.backButton}>
          ← Back to Collection
        </Button>
        <Heading level={1}>{tree.name}</Heading>
        <Text className={styles.species}>{tree.species}</Text>
      </div>

      <div className={styles.content}>
        {/* Main Info Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Heading level={2}>Tree Information</Heading>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <Text className={styles.label}>Status</Text>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(tree.status) }}
                >
                  {tree.status}
                </span>
              </div>

              <div className={styles.infoItem}>
                <Text className={styles.label}>Initial Cost</Text>
                <Text className={styles.value}>
                  {formatCurrency(tree.initialCost)}
                </Text>
              </div>

              <div className={styles.infoItem}>
                <Text className={styles.label}>Acquisition Date</Text>
                <Text className={styles.value}>
                  {formatDate(tree.acquisitionDate)}
                </Text>
              </div>

              <div className={styles.infoItem}>
                <Text className={styles.label}>Age</Text>
                <Text className={styles.value}>
                  {tree.age} year{tree.age !== 1 ? 's' : ''}
                </Text>
              </div>

              {tree.location && (
                <div className={styles.infoItem}>
                  <Text className={styles.label}>Location</Text>
                  <Text className={styles.value}>{tree.location}</Text>
                </div>
              )}

              {tree.potType && (
                <div className={styles.infoItem}>
                  <Text className={styles.label}>Pot Type</Text>
                  <Text className={styles.value}>{tree.potType}</Text>
                </div>
              )}
            </div>

            {tree.notes && (
              <div className={styles.notes}>
                <Text className={styles.label}>Notes</Text>
                <Text className={styles.notesText}>{tree.notes}</Text>
              </div>
            )}
          </div>
        </div>

        {/* Events Timeline */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Heading level={2}>Care History</Heading>
          </div>
          <div className={styles.cardBody}>
            <Table
              aria-label="Bonsai care events"
              className={styles.eventsTable}
            >
              <TableHeader>
                <Column isRowHeader>Event</Column>
                <Column>When</Column>
                <Column>Cost</Column>
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
                          {getTimeAgo(event.date)}
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
              <Heading level={2}>Images</Heading>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.imagesGrid}>
                {[...(tree.images || [])].reverse().map((image, index) => (
                  <div key={index} className={styles.imageContainer}>
                    <img
                      src={image}
                      alt={`${tree.name} - Image ${(tree.images?.length || 0) - index}`}
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
