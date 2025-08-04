import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalComponent, Button } from '../../ui';
import {
  googlePhotosService,
  GooglePhoto,
} from '../../../services/google-photos-service';
import { useAuth } from '../../../context/auth-provider';
import styles from './google-photos-picker.module.scss';

interface GooglePhotosPickerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImagesSelected: (imageUrls: string[]) => void;
  isLoading?: boolean;
}

export const GooglePhotosPicker: FC<GooglePhotosPickerProps> = ({
  isOpen,
  onOpenChange,
  onImagesSelected,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [photos, setPhotos] = useState<GooglePhoto[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadPhotos();
    }
  }, [isOpen, user]);

  const loadPhotos = async () => {
    try {
      setIsLoadingPhotos(true);
      setError(null);

      const response = await googlePhotosService.getPhotos();
      setPhotos(response.mediaItems || []);
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      console.error('Error loading Google Photos:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load photos';

      // Check if it's a configuration error
      if (
        errorMessage.includes('Client ID not configured') ||
        errorMessage.includes('invalid_client')
      ) {
        !showSetupGuide && setShowSetupGuide(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const loadMorePhotos = async () => {
    if (!nextPageToken) return;

    try {
      setIsLoadingPhotos(true);
      const response = await googlePhotosService.getPhotos(nextPageToken);
      setPhotos((prev) => [...prev, ...(response.mediaItems || [])]);
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      console.error('Error loading more photos:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load more photos',
      );
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handlePhotoSelect = (photo: GooglePhoto) => {
    const photoUrl = googlePhotosService.getPhotoUrl(photo);
    setSelectedPhotos((prev) =>
      prev.includes(photoUrl)
        ? prev.filter((url) => url !== photoUrl)
        : [...prev, photoUrl],
    );
  };

  const handleConfirm = () => {
    onImagesSelected(selectedPhotos);
    setSelectedPhotos([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedPhotos([]);
    onOpenChange(false);
  };

  return (
    <ModalComponent isOpen={isOpen} onOpenChange={handleCancel}>
      <div className={styles.picker}>
        <div className={styles.pickerHeader}>
          <h2>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.TITLE')}</h2>
          <p>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.DESCRIPTION')}</p>
        </div>

        <div className={styles.pickerContent}>
          {error ? (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.ERROR')}</h3>
              <p>{error}</p>
              <Button onPress={loadPhotos} variant="primary">
                {t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.RETRY')}
              </Button>
            </div>
          ) : isLoadingPhotos && photos.length === 0 ? (
            <div className={styles.loading}>
              {t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.LOADING')}
            </div>
          ) : photos.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📸</div>
              <h3>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.SETUP_REQUIRED')}</h3>
              <p>{t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.SETUP_DESC')}</p>
              <div className={styles.setupSteps}>
                <ol>
                  <li>
                    {t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.SETUP_STEP_1')}
                  </li>
                  <li>
                    {t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.SETUP_STEP_2')}
                  </li>
                  <li>
                    {t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.SETUP_STEP_3')}
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.photosGrid}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`${styles.photoItem} ${
                      selectedPhotos.includes(
                        googlePhotosService.getPhotoUrl(photo),
                      )
                        ? styles.selected
                        : ''
                    }`}
                    onClick={() => handlePhotoSelect(photo)}
                  >
                    <img
                      src={googlePhotosService.getPhotoUrl(photo, 300)}
                      alt={photo.filename || 'Photo'}
                    />
                  </div>
                ))}
              </div>

              {nextPageToken && (
                <div className={styles.loadMoreContainer}>
                  <Button
                    onPress={loadMorePhotos}
                    variant="secondary"
                    isDisabled={isLoadingPhotos}
                  >
                    {isLoadingPhotos
                      ? t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.LOADING_MORE')
                      : t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.LOAD_MORE')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.pickerActions}>
          <Button
            onPress={handleCancel}
            variant="secondary"
            isDisabled={isLoading}
          >
            {t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.CANCEL')}
          </Button>
          <Button
            onPress={handleConfirm}
            variant="primary"
            isDisabled={isLoading || selectedPhotos.length === 0}
          >
            {t('BONSAI.DETAIL.GOOGLE_PHOTOS_PICKER.SELECT', {
              count: selectedPhotos.length,
            })}
          </Button>
        </div>
      </div>
    </ModalComponent>
  );
};
