import { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DropZone, FileTrigger, Text } from 'react-aria-components';
import { Button } from '../../ui/button';
import { PhotoMetadata } from '../../../types/bonsai';
import styles from './image-upload.module.scss';

interface HybridImageUploadProps {
  bonsaiId: string;
  onPhotosUploaded: (photos: PhotoMetadata[]) => void;
  isUploading?: boolean;
  isDisabled?: boolean;
}

export const HybridImageUpload: FC<HybridImageUploadProps> = ({
  bonsaiId,
  onPhotosUploaded,
  isUploading = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const handleFiles = useCallback(
    async (files: File[]) => {
      try {
        setUploading(true);
        setError('');

        // Import the service dynamically to avoid circular dependencies
        const { BonsaiService } = await import(
          '../../../services/bonsai-service'
        );

        const photoMetadata = await BonsaiService.addPhotos(bonsaiId, files);
        onPhotosUploaded(photoMetadata);
      } catch (error) {
        console.error('Error uploading photos:', error);
        if (error.message.includes('GitHub photo storage is not configured')) {
          setError(
            t('BONSAI.DETAIL.ERROR_GITHUB_NOT_CONFIGURED') ||
              'GitHub photo storage is not configured. Please set up GitHub storage in the settings.',
          );
        } else {
          setError(
            t('BONSAI.DETAIL.ERROR_UPLOADING_IMAGES') ||
              'Error uploading photos',
          );
        }
      } finally {
        setUploading(false);
      }
    },
    [bonsaiId, onPhotosUploaded, t],
  );

  const handleAddUrl = useCallback(async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
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
      {/* Mode Toggle */}
      <div className={styles.modeToggle}>
        <Button
          onPress={() => setUploadMode('file')}
          variant={uploadMode === 'file' ? 'primary' : 'secondary'}
          size="sm"
          isDisabled={isDisabled || isUploading || uploading}
          className={styles.modeButton}
        >
          📁 {t('BONSAI.DETAIL.UPLOAD_FILES') || 'Upload Files'}
        </Button>
        <Button
          onPress={() => setUploadMode('url')}
          variant={uploadMode === 'url' ? 'primary' : 'secondary'}
          size="sm"
          isDisabled={isDisabled || isUploading || uploading}
          className={styles.modeButton}
        >
          🔗 {t('BONSAI.DETAIL.ADD_URL') || 'Add URL'}
        </Button>
      </div>

      {uploadMode === 'file' ? (
        // File Upload Mode
        <>
          <DropZone
            className={styles.dropZone}
            isDisabled={isDisabled || isUploading || uploading}
            onDrop={async (e) => {
              const files = Array.from(e.items || [])
                .filter((item) => item.kind === 'file')
                .map((item) => (item as any).getFile())
                .filter(
                  (file): file is File =>
                    file instanceof File && file.type.startsWith('image/'),
                );
              if (files.length > 0) {
                await handleFiles(files);
              }
            }}
          >
            <div className={styles.dropZoneContent}>
              <div className={styles.dropZoneIcon}>📷</div>
              <Text className={styles.dropZoneText}>
                {t('BONSAI.DETAIL.DRAG_DROP_IMAGES') || 'Drag & Drop Images'}
              </Text>
              <Text className={styles.dropZoneSubtext}>
                {t('BONSAI.DETAIL.DRAG_DROP_SUBTEXT') ||
                  'Drop image files here (max 10MB each) - stored for free on GitHub'}
              </Text>
            </div>
          </DropZone>

          <div className={styles.uploadActions}>
            <FileTrigger
              acceptedFileTypes={['image/*']}
              allowsMultiple
              onSelect={async (e) => {
                const files = Array.from(e || []).filter((file) =>
                  file.type.startsWith('image/'),
                );
                if (files.length > 0) {
                  await handleFiles(files);
                }
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                isDisabled={isDisabled || isUploading || uploading}
                className={styles.uploadButton}
              >
                {t('BONSAI.DETAIL.BROWSE_FILES') || 'Browse Files'}
              </Button>
            </FileTrigger>
          </div>
        </>
      ) : (
        // URL Input Mode
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
      )}

      {(isUploading || uploading) && (
        <div className={styles.uploadingIndicator}>
          {uploadMode === 'file'
            ? (t('BONSAI.DETAIL.UPLOADING_IMAGES') || 'Uploading images') +
              '...'
            : (t('BONSAI.DETAIL.ADDING_IMAGE_URL') || 'Adding image URL') +
              '...'}
        </div>
      )}
    </div>
  );
};
