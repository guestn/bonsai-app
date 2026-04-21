import { type ChangeEvent, FC, useRef, useState } from 'react';
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
  formatDateShort,
  getTimeAgo,
  formatAge,
} from '../../../utils/formatters';
import { useBonsaiMutations } from '../../../hooks/use-bonsai';
import { useAuth } from '../../../context/auth-provider';
import {
  deleteBonsaiBlobFromStore,
  getPhotoMetadataFromFile,
  uploadBonsaiPhotoToBlob,
} from '../../../services/vercel-blob-client';
import { getExifTakenAtIso } from '../../../utils/photo-exif';
import {
  getPhotoDisplayDate,
  sameCalendarDay,
} from '../../../utils/photo-date';
import { Button, Chip } from '../../../components/ui';
import {
  AddEventModal,
  DeleteEventModal,
  DeleteTreeModal,
  UpdateEventModal,
  EditTreeModal,
  EditPhotoDateModal,
} from './lib';
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
  const { isAuthorized, user } = useAuth();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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
  const [isDeleteTreeModalOpen, setIsDeleteTreeModalOpen] = useState(false);
  const [isDeletingTree, setIsDeletingTree] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [photoForDateEdit, setPhotoForDateEdit] =
    useState<PhotoMetadata | null>(null);
  const [isSavingPhotoDate, setIsSavingPhotoDate] = useState(false);

  const {
    addEvent,
    deleteEvent,
    updateEvent,
    updateBonsai,
    deleteBonsai,
    deletePhotos,
  } = useBonsaiMutations();

  const sortedEvents = [...tree.events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const sortedPhotos = [...(tree.photos || [])].sort(
    (a, b) =>
      new Date(getPhotoDisplayDate(b)).getTime() -
      new Date(getPhotoDisplayDate(a)).getTime(),
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

  const handleDeleteTree = async () => {
    try {
      setIsDeletingTree(true);
      await deleteBonsai(tree.id);
      // Navigate back to the list after successful deletion
      onBack();
    } catch (error) {
      console.error('Error deleting tree:', error);
      alert(t('BONSAI.DETAIL.ERROR_DELETING_TREE'));
    } finally {
      setIsDeletingTree(false);
    }
  };

  const handlePhotoInputChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user) return;

    try {
      setIsUploadingPhoto(true);
      const idToken = await user.getIdToken();
      const [exifTakenAt, { width, height }, blobResult] = await Promise.all([
        getExifTakenAtIso(file),
        getPhotoMetadataFromFile(file),
        uploadBonsaiPhotoToBlob(tree.id, file, idToken),
      ]);

      const newPhoto: PhotoMetadata = {
        id: `${Date.now()}`,
        url: blobResult.url,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || blobResult.contentType,
        uploadedAt: new Date().toISOString(),
        ...(exifTakenAt ? { takenAt: exifTakenAt } : {}),
        width,
        height,
        source: 'vercel-blob',
        storagePath: blobResult.pathname,
      };

      const nextPhotos = [...(tree.photos || []), newPhoto];
      await updateBonsai(tree.id, { photos: nextPhotos });
      await mutate();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(t('BONSAI.DETAIL.ERROR_UPLOADING_IMAGES'));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSavePhotoDate = async (takenAtIso: string | null) => {
    if (!photoForDateEdit) return;

    try {
      setIsSavingPhotoDate(true);
      const editingId = photoForDateEdit.id;
      const nextPhotos = (tree.photos || []).map((p) => {
        if (p.id !== editingId) return p;
        if (takenAtIso === null) {
          const rest = { ...p };
          delete rest.takenAt;
          return rest;
        }
        return { ...p, takenAt: takenAtIso };
      });

      await updateBonsai(tree.id, { photos: nextPhotos });
      await mutate();
      setPhotoForDateEdit(null);
    } catch (error) {
      console.error('Error updating photo date:', error);
      alert(t('BONSAI.DETAIL.ERROR_UPDATING_PHOTO_DATE'));
    } finally {
      setIsSavingPhotoDate(false);
    }
  };

  const handleDeletePhoto = async (photo: PhotoMetadata) => {
    if (
      !window.confirm(
        t('BONSAI.DETAIL.CONFIRM_DELETE_PHOTO', {
          fileName: photo.fileName || t('BONSAI.DETAIL.PHOTO_FALLBACK_LABEL'),
        }),
      )
    ) {
      return;
    }

    if (!user) return;

    try {
      setDeletingPhotoId(photo.id);
      const idToken = await user.getIdToken();

      if (photo.source === 'vercel-blob' && photo.url) {
        try {
          await deleteBonsaiBlobFromStore(photo.url, idToken);
        } catch (blobError) {
          console.warn('Could not delete blob object:', blobError);
        }
      }

      await deletePhotos(tree.id, [photo.id], mutate);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert(t('BONSAI.DETAIL.ERROR_DELETING_PHOTO'));
    } finally {
      setDeletingPhotoId(null);
    }
  };

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
            <div className={styles.treeActions}>
              <Button
                onPress={() => setIsEditTreeModalOpen(true)}
                variant="secondary"
                size="sm"
                isDisabled={!isAuthorized}
              >
                ✏️ {t('BONSAI.DETAIL.EDIT_TREE')}
              </Button>
              <Button
                onPress={() => setIsDeleteTreeModalOpen(true)}
                variant="danger"
                size="sm"
                isDisabled={!isAuthorized}
              >
                🗑️ {t('BONSAI.DETAIL.DELETE_TREE')}
              </Button>
            </div>
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
                {formatDateShort(tree.acquisitionDate)}
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
                        {formatDateShort(event.date)}
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
          {isAuthorized && (
            <div className={styles.photoHeaderActions}>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className={styles.hiddenFileInput}
                onChange={handlePhotoInputChange}
                aria-label={t('BONSAI.DETAIL.UPLOAD_PHOTO')}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className={styles.hiddenFileInput}
                onChange={handlePhotoInputChange}
                aria-label={t('BONSAI.DETAIL.TAKE_PHOTO')}
              />
              <Button
                onPress={() => cameraInputRef.current?.click()}
                variant="secondary"
                size="sm"
                isDisabled={isUploadingPhoto || !user}
              >
                {t('BONSAI.DETAIL.TAKE_PHOTO')}
              </Button>
              <Button
                onPress={() => photoInputRef.current?.click()}
                variant="primary"
                size="sm"
                isDisabled={isUploadingPhoto || !user}
              >
                {isUploadingPhoto
                  ? t('BONSAI.DETAIL.UPLOADING_PHOTO')
                  : t('BONSAI.DETAIL.UPLOAD_PHOTO')}
              </Button>
            </div>
          )}
        </div>
        <div className={styles.cardBody}>
          {isAuthorized && (
            <Text className={styles.photosHint}>
              {t('BONSAI.DETAIL.PHOTOS_HINT')}
            </Text>
          )}
          {tree.photos && tree.photos.length > 0 ? (
            <div className={styles.imagesGrid}>
              {sortedPhotos.map((photo, index) => {
                const imageNumber = sortedPhotos.length - index;
                return (
                  <div key={photo.id} className={styles.photoContainer}>
                    <div className={styles.photoThumbWrap}>
                      <a
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.imageWrapper}
                        aria-label={t('BONSAI.DETAIL.IMAGE_ALT', {
                          treeName: tree.name,
                          imageNumber,
                        })}
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className={styles.image}
                          loading="lazy"
                          decoding="async"
                        />
                        <div className={styles.imageOverlay}>
                          <span className={styles.viewDetails}>
                            {t('BONSAI.DETAIL.VIEW_FULL_SIZE')}
                          </span>
                        </div>
                      </a>
                      {isAuthorized && (
                        <>
                          <Button
                            onPress={() => setPhotoForDateEdit(photo)}
                            variant="secondary"
                            size="sm"
                            className={styles.editPhotoDateButton}
                            isDisabled={
                              deletingPhotoId !== null || isSavingPhotoDate
                            }
                            aria-label={t(
                              'BONSAI.DETAIL.EDIT_PHOTO_DATE_ARIA',
                              {
                                fileName:
                                  photo.fileName ||
                                  t('BONSAI.DETAIL.PHOTO_FALLBACK_LABEL'),
                              },
                            )}
                          >
                            ✏️
                          </Button>
                          <Button
                            onPress={() => handleDeletePhoto(photo)}
                            variant="danger"
                            size="sm"
                            className={styles.deletePhotoButton}
                            isDisabled={deletingPhotoId !== null}
                            aria-label={t('BONSAI.DETAIL.DELETE_PHOTO_ARIA', {
                              fileName:
                                photo.fileName ||
                                t('BONSAI.DETAIL.PHOTO_FALLBACK_LABEL'),
                            })}
                          >
                            {deletingPhotoId === photo.id
                              ? t('BONSAI.DETAIL.PHOTO_MODAL.DELETING')
                              : '🗑️'}
                          </Button>
                        </>
                      )}
                    </div>
                    <div className={styles.photoInfo}>
                      <span className={styles.uploadDate}>
                        {formatDateShort(getPhotoDisplayDate(photo))}
                      </span>
                      {photo.takenAt &&
                        !sameCalendarDay(
                          photo.takenAt,
                          photo.uploadedAt,
                        ) && (
                          <span className={styles.uploadedMeta}>
                            {t('BONSAI.DETAIL.PHOTO_UPLOADED_ON', {
                              date: formatDateShort(photo.uploadedAt),
                            })}
                          </span>
                        )}
                      {photo.width && photo.height && (
                        <span className={styles.dimensions}>
                          {photo.width} × {photo.height}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Text className={styles.emptyPhotos}>
              {t('BONSAI.DETAIL.NO_PHOTOS_YET')}
            </Text>
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

      <DeleteTreeModal
        tree={tree}
        isOpen={isDeleteTreeModalOpen}
        onOpenChange={setIsDeleteTreeModalOpen}
        onConfirm={handleDeleteTree}
        isLoading={isDeletingTree}
      />

      {photoForDateEdit && (
        <EditPhotoDateModal
          tree={tree}
          photo={photoForDateEdit}
          isOpen
          onOpenChange={(open) => {
            if (!open) setPhotoForDateEdit(null);
          }}
          onSubmit={handleSavePhotoDate}
          isLoading={isSavingPhotoDate}
        />
      )}
    </div>
  );
};
