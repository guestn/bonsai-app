import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heading,
  Text,
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
} from 'react-aria-components';
import { BonsaiTree, BonsaiEvent, PhotoMetadata } from '../../../types/bonsai';
import {
  formatCurrency,
  formatDate,
  getTimeAgo,
  formatAge,
} from '../../../utils/formatters';
import { useBonsaiMutations } from '../../../hooks/use-bonsai';
import { useAuth } from '../../../context/auth-provider';
import { Button, Chip } from '../../../components/ui';
import {
  AddEventModal,
  DeleteEventModal,
  UpdateEventModal,
  EditTreeModal,
  PhotoModal,
} from './lib';
import { GoogleDriveImageUpload } from './google-drive-image-upload';
import { PhotoDisplay } from './photo-display';
import styles from './bonsai-detail.module.scss';

interface BonsaiDetailProps {
  tree: BonsaiTree;
  onBack: () => void;
  mutate: () => Promise<any>;
}

export const BonsaiDetail: FC<BonsaiDetailProps> = ({
  tree,
  onBack,
  mutate,
}) => {
  const { t } = useTranslation();
  const { isAuthorized } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<BonsaiEvent | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [eventToUpdate, setEventToUpdate] = useState<BonsaiEvent | null>(null);
  const [isEditTreeModalOpen, setIsEditTreeModalOpen] = useState(false);
  const [isUpdatingTree, setIsUpdatingTree] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(
    null,
  );
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [isEditingPhotoUrl, setIsEditingPhotoUrl] = useState(false);
  const { addEvent, deleteEvent, updateEvent, updateBonsai } =
    useBonsaiMutations();

  const sortedEvents = [...tree.events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handleAddEvent = async (event: {
    description: string;
    date: string;
    cost?: number;
    status?: 'active' | 'expired';
  }) => {
    try {
      setIsAddingEvent(true);

      await addEvent(
        tree.id,
        {
          description: event.description,
          date: event.date,
          cost: event.cost,
        },
        mutate,
      );

      if (event.status && event.status !== tree.status) {
        await updateBonsai(tree.id, { status: event.status });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding event:', error);
      alert(t('BONSAI.DETAIL.ERROR_ADDING_EVENT'));
    } finally {
      setIsAddingEvent(false);
    }
  };

  const handleUpdateEvent = (event: BonsaiEvent) => {
    setEventToUpdate(event);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateEventSubmit = async (event: {
    description: string;
    date: string;
    cost?: number;
    status?: 'active' | 'expired';
  }) => {
    if (!eventToUpdate) return;

    try {
      setIsUpdatingEvent(true);

      // Update the event
      await updateEvent(
        tree.id,
        eventToUpdate.id,
        {
          description: event.description,
          date: event.date,
          cost: event.cost,
        },
        mutate,
      );

      // Update tree status if it changed
      if (event.status && event.status !== tree.status) {
        await updateBonsai(tree.id, { status: event.status });
      }

      setIsUpdateModalOpen(false);
      setEventToUpdate(null);
    } catch (error) {
      console.error('Error updating event:', error);
      alert(t('BONSAI.DETAIL.ERROR_UPDATING_EVENT'));
    } finally {
      setIsUpdatingEvent(false);
    }
  };

  const handleDeleteEvent = (event: BonsaiEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      setIsDeletingEvent(true);
      await deleteEvent(tree.id, eventToDelete.id, mutate);
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(t('BONSAI.DETAIL.ERROR_DELETING_EVENT'));
    } finally {
      setIsDeletingEvent(false);
    }
  };

  const handleEditTree = async (treeData: {
    name: string;
    species: string;
    status: 'active' | 'expired';
    location?: string;
    potType?: string;
    notes?: string;
  }) => {
    try {
      setIsUpdatingTree(true);
      await updateBonsai(tree.id, treeData);
      await mutate();
      setIsEditTreeModalOpen(false);
    } catch (error) {
      console.error('Error updating tree:', error);
      alert(t('BONSAI.DETAIL.ERROR_UPDATING_TREE'));
    } finally {
      setIsUpdatingTree(false);
    }
  };

  const handlePhotosUploaded = async (newPhotos: PhotoMetadata[]) => {
    try {
      setIsUploadingImages(true);
      const updatedPhotos = [...(tree.photos || []), ...newPhotos];
      await updateBonsai(tree.id, { photos: updatedPhotos });
      await mutate();
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert(t('BONSAI.DETAIL.ERROR_UPLOADING_IMAGES'));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handlePhotoClick = (photo: PhotoMetadata) => {
    console.info('Photo clicked:', { photoId: photo.id, photoUrl: photo.url });
    setSelectedPhoto(photo);
    setIsPhotoModalOpen(true);
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      setIsDeletingPhoto(true);
      const { BonsaiService } = await import(
        '../../../services/bonsai-service'
      );
      await BonsaiService.deletePhotos(tree.id, [photoId]);
      await mutate();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert(t('BONSAI.DETAIL.ERROR_DELETING_PHOTO') || 'Error deleting photo');
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleEditPhotoUrl = async (photoId: string, newUrl: string) => {
    try {
      setIsEditingPhotoUrl(true);
      const updatedPhotos =
        tree.photos?.map((photo) =>
          photo.id === photoId ? { ...photo, url: newUrl } : photo,
        ) || [];
      await updateBonsai(tree.id, { photos: updatedPhotos });
      await mutate();
    } catch (error) {
      console.error('Error updating photo URL:', error);
      alert(
        t('BONSAI.DETAIL.ERROR_UPDATING_PHOTO_URL') ||
          'Error updating photo URL',
      );
    } finally {
      setIsEditingPhotoUrl(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  console.info('Photo modal state:', { selectedPhoto, isPhotoModalOpen });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          onPress={onBack}
          variant="secondary"
          size="sm"
          className={styles.backButton}
        >
          {t('BONSAI.DETAIL.BACK_TO_COLLECTION')}
        </Button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.treeHeader}>
            <Heading level={1} className={styles.treeName}>
              {tree.name}
            </Heading>
            <Button
              onPress={() => setIsEditTreeModalOpen(true)}
              variant="secondary"
              size="sm"
              isDisabled={!isAuthorized}
            >
              ✏️ {t('BONSAI.DETAIL.EDIT_TREE')}
            </Button>
          </div>
          <Chip
            label={t(`BONSAI.COLLECTION.STATUSES.${tree.status.toUpperCase()}`)}
            variant={tree.status}
            size="md"
          />
        </div>
        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Text className={styles.infoLabel}>
                {t('BONSAI.DETAIL.LABELS.SPECIES')}
              </Text>
              <Text className={styles.infoValue}>{tree.species}</Text>
            </div>
            <div className={styles.infoItem}>
              <Text className={styles.infoLabel}>
                {t('BONSAI.COLLECTION.TYPE')}
              </Text>
              <div className={styles.infoValue}>
                <Chip
                  label={t(
                    `BONSAI.COLLECTION.TYPES.${(tree.type || 'purchased').toUpperCase()}`,
                  )}
                  variant={tree.type || 'purchased'}
                  size="sm"
                />
              </div>
            </div>
            <div className={styles.infoItem}>
              <Text className={styles.infoLabel}>
                {t('BONSAI.DETAIL.LABELS.INITIAL_COST')}
              </Text>
              <Text className={styles.infoValue}>
                {formatCurrency(tree.initialCost)}
              </Text>
            </div>
            <div className={styles.infoItem}>
              <Text className={styles.infoLabel}>
                {t('BONSAI.DETAIL.LABELS.ACQUISITION_DATE')}
              </Text>
              <Text className={styles.infoValue}>
                {formatDate(tree.acquisitionDate)}
              </Text>
            </div>
            <div className={styles.infoItem}>
              <Text className={styles.infoLabel}>
                {t('BONSAI.DETAIL.LABELS.AGE')}
              </Text>
              <Text className={styles.infoValue}>
                {formatAge(
                  (new Date().getTime() -
                    new Date(tree.acquisitionDate).getTime()) /
                    (1000 * 60 * 60 * 24 * 365.25),
                  t,
                )}
              </Text>
            </div>
            {tree.location && (
              <div className={styles.infoItem}>
                <Text className={styles.infoLabel}>
                  {t('BONSAI.DETAIL.LABELS.LOCATION')}
                </Text>
                <Text className={styles.infoValue}>{tree.location}</Text>
              </div>
            )}
            {tree.potType && (
              <div className={styles.infoItem}>
                <Text className={styles.infoLabel}>
                  {t('BONSAI.DETAIL.LABELS.POT_TYPE')}
                </Text>
                <Text className={styles.infoValue}>{tree.potType}</Text>
              </div>
            )}
            {tree.notes && (
              <div className={styles.infoItem}>
                <Text className={styles.infoLabel}>
                  {t('BONSAI.DETAIL.LABELS.NOTES')}
                </Text>
                <Text className={styles.infoValue}>{tree.notes}</Text>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Heading level={2}>{t('BONSAI.DETAIL.CARE_HISTORY')}</Heading>
          <Button
            onPress={() => setIsModalOpen(true)}
            variant="primary"
            size="sm"
            isDisabled={!isAuthorized}
          >
            {t('BONSAI.DETAIL.ADD_EVENT')}
          </Button>
        </div>
        <div className={styles.cardBody}>
          <Table aria-label="Bonsai care events" className={styles.eventsTable}>
            <TableHeader>
              <Column isRowHeader>
                {t('BONSAI.DETAIL.EVENTS_TABLE.EVENT')}
              </Column>
              <Column>{t('BONSAI.DETAIL.EVENTS_TABLE.WHEN')}</Column>
              <Column>{t('BONSAI.DETAIL.EVENTS_TABLE.COST')}</Column>
              <Column>{t('BONSAI.DETAIL.EVENTS_TABLE.ACTIONS')}</Column>
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
                  <Cell>
                    <div className={styles.actionButtons}>
                      <Button
                        onPress={() => handleUpdateEvent(event)}
                        variant="secondary"
                        size="sm"
                        className={styles.actionButton}
                        isDisabled={!isAuthorized}
                        aria-label={t(
                          'BONSAI.DETAIL.EVENTS_TABLE.UPDATE_EVENT',
                          {
                            eventDescription: event.description,
                          },
                        )}
                      >
                        ✏️
                      </Button>
                      <Button
                        onPress={() => handleDeleteEvent(event)}
                        variant="secondary"
                        size="sm"
                        className={styles.actionButton}
                        isDisabled={!isAuthorized}
                        aria-label={t(
                          'BONSAI.DETAIL.EVENTS_TABLE.DELETE_EVENT',
                          {
                            eventDescription: event.description,
                          },
                        )}
                      >
                        🗑️
                      </Button>
                    </div>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Heading level={2}>{t('BONSAI.DETAIL.IMAGES')}</Heading>
        </div>
        <div className={styles.cardBody}>
          {tree.photos && tree.photos.length > 0 && (
            <div className={styles.imagesGrid}>
              {[...(tree.photos || [])].reverse().map((photo, index) => (
                <div key={photo.id} className={styles.photoContainer}>
                  <div
                    className={styles.imageWrapper}
                    onClick={() => handlePhotoClick(photo)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePhotoClick(photo);
                      }
                    }}
                  >
                    <PhotoDisplay
                      photo={photo}
                      alt={t('BONSAI.DETAIL.IMAGE_ALT', {
                        treeName: tree.name,
                        imageNumber: (tree.photos?.length || 0) - index,
                      })}
                      className={styles.image}
                    />
                    <div className={styles.imageOverlay}>
                      <span className={styles.viewDetails}>View Details</span>
                    </div>
                  </div>
                  <div className={styles.photoInfo}>
                    <span className={styles.uploadDate}>
                      {formatDate(photo.uploadedAt)}
                    </span>
                    {photo.width && photo.height && (
                      <span className={styles.dimensions}>
                        {photo.width} × {photo.height}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAuthorized && (
            <GoogleDriveImageUpload
              bonsaiId={tree.id}
              onPhotosUploaded={handlePhotosUploaded}
              isUploading={isUploadingImages}
              isDisabled={!isAuthorized}
            />
          )}
        </div>
      </div>

      <AddEventModal
        tree={tree}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddEvent}
        isLoading={isAddingEvent}
      />

      {eventToUpdate && (
        <UpdateEventModal
          tree={tree}
          event={eventToUpdate}
          isOpen={isUpdateModalOpen}
          onOpenChange={setIsUpdateModalOpen}
          onSubmit={handleUpdateEventSubmit}
          isLoading={isUpdatingEvent}
        />
      )}

      {eventToDelete && (
        <DeleteEventModal
          event={eventToDelete}
          isOpen={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={confirmDeleteEvent}
          isLoading={isDeletingEvent}
        />
      )}

      <EditTreeModal
        tree={tree}
        isOpen={isEditTreeModalOpen}
        onOpenChange={setIsEditTreeModalOpen}
        onSubmit={handleEditTree}
        isLoading={isUpdatingTree}
      />

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          isOpen={isPhotoModalOpen}
          onOpenChange={setIsPhotoModalOpen}
          onDelete={handleDeletePhoto}
          onEditUrl={handleEditPhotoUrl}
          isDeleting={isDeletingPhoto}
          isEditing={isEditingPhotoUrl}
        />
      )}
    </div>
  );
};
