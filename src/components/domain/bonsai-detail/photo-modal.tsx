import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalComponent } from '@/components/ui/modal';
import { Button } from '../../ui/button';
import { PhotoMetadata } from '../../../types/bonsai';
import { GoogleDrivePhotoService } from '../../../services/google-drive-photo-service';
import { PhotoDisplay } from './photo-display';
import styles from './photo-modal.module.scss';

interface PhotoModalProps {
  photo: PhotoMetadata;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelete: (photoId: string) => void;
  onEditUrl: (photoId: string, newUrl: string) => void;
  isDeleting?: boolean;
  isEditing?: boolean;
}

export const PhotoModal: FC<PhotoModalProps> = ({
  photo,
  isOpen,
  onOpenChange,
  onDelete,
  onEditUrl,
  isDeleting = false,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const [newUrl, setNewUrl] = useState(photo.url);
  const [urlError, setUrlError] = useState('');

  const handleEditUrl = () => {
    if (!newUrl.trim()) {
      setUrlError('Please enter a valid URL');
      return;
    }

    try {
      new URL(newUrl);
      setUrlError('');
    } catch {
      setUrlError('Please enter a valid URL');
      return;
    }

    onEditUrl(photo.id, newUrl);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setNewUrl(photo.url);
    setUrlError('');
    setEditMode(false);
  };

  const handleDelete = async () => {
    if (
      confirm(
        t('BONSAI.DETAIL.PHOTO_MODAL.CONFIRM_DELETE') ||
          'Are you sure you want to delete this photo?',
      )
    ) {
      try {
        // If it's a Google Drive photo, delete it from Google Drive first
        if (photo.source === 'google-drive') {
          await GoogleDrivePhotoService.deletePhoto(photo.id);
        }

        // Then remove it from the bonsai tree
        onDelete(photo.id);
        onOpenChange(false);
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Failed to delete photo. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ModalComponent
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('BONSAI.DETAIL.PHOTO_MODAL.TITLE') || 'Photo Details'}
      size="lg"
    >
      <div className={styles.modalBody}>
        <div className={styles.imageContainer}>
          <PhotoDisplay
            photo={photo}
            alt={
              t('BONSAI.DETAIL.PHOTO_MODAL.IMAGE_ALT', {
                photoId: photo.id,
              }) || 'Photo'
            }
            className={styles.largeImage}
          />
        </div>

        <div className={styles.photoDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {t('BONSAI.DETAIL.PHOTO_MODAL.UPLOADED') || 'Uploaded:'}
            </span>
            <span className={styles.detailValue}>
              {formatDate(photo.uploadedAt)}
            </span>
          </div>

          {photo.width && photo.height && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t('BONSAI.DETAIL.PHOTO_MODAL.DIMENSIONS') || 'Dimensions:'}
              </span>
              <span className={styles.detailValue}>
                {photo.width} × {photo.height} px
              </span>
            </div>
          )}

          {photo.fileSize && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>
                {t('BONSAI.DETAIL.PHOTO_MODAL.FILE_SIZE') || 'File size:'}
              </span>
              <span className={styles.detailValue}>
                {(photo.fileSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              {t('BONSAI.DETAIL.PHOTO_MODAL.URL') || 'URL:'}
            </span>
            <div className={styles.urlContainer}>
              {editMode ? (
                <div className={styles.editUrlContainer}>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className={styles.urlInput}
                    placeholder="https://example.com/image.jpg"
                  />
                  {urlError && (
                    <span className={styles.urlError}>{urlError}</span>
                  )}
                </div>
              ) : (
                <span className={styles.urlValue} title={photo.url}>
                  {photo.url}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <div className={styles.actionButtons}>
          {editMode ? (
            <>
              <Button
                onPress={handleEditUrl}
                variant="primary"
                size="sm"
                isDisabled={isEditing}
                className={styles.editButton}
              >
                {isEditing
                  ? t('BONSAI.DETAIL.PHOTO_MODAL.SAVING') || 'Saving...'
                  : t('BONSAI.DETAIL.PHOTO_MODAL.SAVE') || 'Save'}
              </Button>
              <Button
                onPress={handleCancelEdit}
                variant="secondary"
                size="sm"
                isDisabled={isEditing}
                className={styles.cancelButton}
              >
                {t('BONSAI.DETAIL.PHOTO_MODAL.CANCEL') || 'Cancel'}
              </Button>
            </>
          ) : (
            <>
              <Button
                onPress={() => setEditMode(true)}
                variant="secondary"
                size="sm"
                className={styles.editButton}
              >
                {t('BONSAI.DETAIL.PHOTO_MODAL.EDIT_URL') || 'Edit URL'}
              </Button>
              <Button
                onPress={handleDelete}
                variant="danger"
                size="sm"
                isDisabled={isDeleting}
                className={styles.deleteButton}
              >
                {isDeleting
                  ? t('BONSAI.DETAIL.PHOTO_MODAL.DELETING') || 'Deleting...'
                  : t('BONSAI.DETAIL.PHOTO_MODAL.DELETE') || 'Delete'}
              </Button>
            </>
          )}
        </div>
      </div>
    </ModalComponent>
  );
};
