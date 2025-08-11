import { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DropZone, FileTrigger, Text } from 'react-aria-components';
import { Button } from '../../../ui/button';
import { PhotoMetadata } from '../../../../types/bonsai';
import styles from './image-upload.module.scss';

interface ImageUploadProps {
  bonsaiId: string;
  onPhotosUploaded: (photos: PhotoMetadata[]) => void;
  isUploading?: boolean;
  isDisabled?: boolean;
}

export const ImageUpload: FC<ImageUploadProps> = ({
  bonsaiId,
  onPhotosUploaded,
  isUploading = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      try {
        setUploading(true);

        // Import the service dynamically to avoid circular dependencies
        const { BonsaiService } = await import(
          '../../../../services/bonsai-service'
        );

        const photoMetadata = await BonsaiService.addPhotos(bonsaiId, files);
        onPhotosUploaded(photoMetadata);
      } catch (error) {
        console.error('Error uploading photos:', error);
        alert(t('BONSAI.DETAIL.ERROR_UPLOADING_IMAGES'));
      } finally {
        setUploading(false);
      }
    },
    [bonsaiId, onPhotosUploaded, t],
  );

  return (
    <div className={styles.imageUpload}>
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
            {t('BONSAI.DETAIL.DRAG_DROP_IMAGES')}
          </Text>
          <Text className={styles.dropZoneSubtext}>
            {t('BONSAI.DETAIL.DRAG_DROP_SUBTEXT')}
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
            {t('BONSAI.DETAIL.BROWSE_FILES')}
          </Button>
        </FileTrigger>
      </div>

      {(isUploading || uploading) && (
        <div className={styles.uploadingIndicator}>
          {t('BONSAI.DETAIL.UPLOADING_IMAGES')}...
        </div>
      )}
    </div>
  );
};
