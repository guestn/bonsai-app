import { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DropZone, FileTrigger, Text } from 'react-aria-components';
import { Button } from '../../ui/button';
import { GooglePhotosPicker } from './google-photos-picker';
import styles from './image-upload.module.scss';

interface ImageUploadProps {
  onImagesUploaded: (images: string[]) => void;
  isUploading?: boolean;
  isDisabled?: boolean;
}

export const ImageUpload: FC<ImageUploadProps> = ({
  onImagesUploaded,
  isUploading = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const [isGooglePhotosOpen, setIsGooglePhotosOpen] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      try {
        const imageUrls: string[] = [];

        for (const file of files) {
          const url = await convertFileToUrl(file);
          imageUrls.push(url);
        }

        onImagesUploaded(imageUrls);
      } catch (error) {
        console.error('Error processing images:', error);
        alert(t('BONSAI.DETAIL.ERROR_UPLOADING_IMAGES'));
      }
    },
    [onImagesUploaded, t],
  );

  const convertFileToUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGooglePhotosClick = () => {
    setIsGooglePhotosOpen(true);
  };

  const handleGooglePhotosImagesSelected = (imageUrls: string[]) => {
    onImagesUploaded(imageUrls);
    setIsGooglePhotosOpen(false);
  };

  return (
    <div className={styles.imageUpload}>
      <DropZone
        className={styles.dropZone}
        isDisabled={isDisabled || isUploading}
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
            isDisabled={isDisabled || isUploading}
            className={styles.uploadButton}
          >
            {t('BONSAI.DETAIL.BROWSE_FILES')}
          </Button>
        </FileTrigger>

        <Button
          onPress={handleGooglePhotosClick}
          variant="secondary"
          size="sm"
          isDisabled={isDisabled || isUploading}
          className={styles.uploadButton}
        >
          📸 {t('BONSAI.DETAIL.GOOGLE_PHOTOS')}
        </Button>
      </div>

      {isUploading && (
        <div className={styles.uploadingIndicator}>
          {t('BONSAI.DETAIL.UPLOADING_IMAGES')}...
        </div>
      )}

      <GooglePhotosPicker
        isOpen={isGooglePhotosOpen}
        onOpenChange={setIsGooglePhotosOpen}
        onImagesSelected={handleGooglePhotosImagesSelected}
        isLoading={isUploading}
      />
    </div>
  );
};
