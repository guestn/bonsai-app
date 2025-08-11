import { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-aria-components';
import { Button } from '../../ui/button';
import { ExternalPhotoService } from '../../../services/external-photo-service';
import styles from './image-upload.module.scss';

interface ExternalImageUploadProps {
  bonsaiId: string;
  onPhotosUploaded: (photos: any[]) => void;
  isUploading?: boolean;
  isDisabled?: boolean;
}

export const ExternalImageUpload: FC<ExternalImageUploadProps> = ({
  bonsaiId,
  onPhotosUploaded,
  isUploading = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleAddUrl = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    if (!ExternalPhotoService.validateUrl(url)) {
      setError('Please enter a valid image URL');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Import the service dynamically to avoid circular dependencies
      const { BonsaiService } = await import(
        '../../../services/bonsai-service'
      );

      const photoMetadata = await BonsaiService.addExternalPhotos(bonsaiId, [
        url,
      ]);
      onPhotosUploaded(photoMetadata);
      setUrl('');
    } catch (error) {
      console.error('Error adding external photo:', error);
      setError('Failed to add image URL. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [url, bonsaiId, onPhotosUploaded]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddUrl();
    }
  };

  return (
    <div className={styles.imageUpload}>
      <div className={styles.urlInputContainer}>
        <Text className={styles.dropZoneText}>
          {t('BONSAI.DETAIL.ADD_IMAGE_URL') || 'Add Image URL'}
        </Text>
        <div className={styles.urlInputWrapper}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com/image.jpg"
            className={styles.urlInput}
            disabled={isDisabled || isUploading || uploading}
          />
          <Button
            onPress={handleAddUrl}
            variant="secondary"
            size="sm"
            isDisabled={isDisabled || isUploading || uploading || !url.trim()}
            className={styles.addUrlButton}
          >
            {t('BONSAI.DETAIL.ADD_URL') || 'Add URL'}
          </Button>
        </div>
        {error && <Text className={styles.errorText}>{error}</Text>}
      </div>

      {(isUploading || uploading) && (
        <div className={styles.uploadingIndicator}>
          {t('BONSAI.DETAIL.ADDING_IMAGE_URL') || 'Adding image URL'}...
        </div>
      )}
    </div>
  );
};
