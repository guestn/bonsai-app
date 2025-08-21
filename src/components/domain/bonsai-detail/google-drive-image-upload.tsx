import { FC, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DropZone, FileTrigger, Text } from 'react-aria-components';
import { Button } from '../../ui/button';
import { PhotoMetadata } from '../../../types/bonsai';
import { GoogleDrivePhotoService } from '../../../services/google-drive-photo-service';
import styles from './image-upload.module.scss';

interface GoogleDriveImageUploadProps {
  bonsaiId: string;
  onPhotosUploaded: (photos: PhotoMetadata[]) => void;
  isUploading?: boolean;
  isDisabled?: boolean;
}

export const GoogleDriveImageUpload: FC<GoogleDriveImageUploadProps> = ({
  bonsaiId,
  onPhotosUploaded,
  isUploading = false,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      // Try to auto-configure if not already configured
      if (!GoogleDrivePhotoService.isConfigured()) {
        console.info(
          'Google Drive not configured, attempting auto-configuration...',
        );
        try {
          await GoogleDrivePhotoService.ensureConfigured();
          console.info('Google Drive auto-configuration successful');
        } catch (error) {
          console.error('Google Drive auto-configuration failed:', error);
          alert(
            'Google Drive is not configured. Please check your environment variables.',
          );
          return;
        }
      } else {
        console.info('✅ Google Drive already configured');
      }

      // Check authentication status
      console.info(
        '🔐 Authentication status:',
        GoogleDrivePhotoService.isAuthenticated(),
      );
      console.info(
        '🔐 Access token present:',
        !!GoogleDrivePhotoService['accessToken'],
      );

      if (!GoogleDrivePhotoService.isAuthenticated()) {
        console.info('🔐 Not authenticated, starting authentication...');
        const authSuccess = await GoogleDrivePhotoService.authenticate();
        console.info('🔐 Authentication result:', authSuccess);
        if (!authSuccess) {
          alert('Failed to authenticate with Google Drive. Please try again.');
          return;
        }
      } else {
        console.info('✅ Already authenticated');
      }

      try {
        setUploading(true);

        // Use the bonsai service to handle file uploads
        const { BonsaiService } = await import(
          '../../../services/bonsai-service'
        );
        const uploadedPhotos = await BonsaiService.addPhotos(bonsaiId, files);

        onPhotosUploaded(uploadedPhotos);
      } catch (error) {
        console.error('Error uploading photos:', error);
        alert('Error uploading photos. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [bonsaiId, onPhotosUploaded],
  );

  const [isServiceReady, setIsServiceReady] = useState(false);

  // Check if service is ready on mount and when configuration changes
  useEffect(() => {
    const checkService = async () => {
      try {
        // Small delay to ensure URL hash is available
        await new Promise((resolve) => setTimeout(resolve, 100));

        // First check for any OAuth tokens that might be in the URL
        GoogleDrivePhotoService.checkForOAuthToken();

        if (GoogleDrivePhotoService.isConfigured()) {
          setIsServiceReady(true);
        } else {
          // Try to auto-configure
          await GoogleDrivePhotoService.ensureConfigured();
          setIsServiceReady(true);
        }
      } catch (error) {
        console.error('Failed to configure Google Drive service:', error);
        setIsServiceReady(false);
      }
    };

    checkService();
  }, []);

  return (
    <div className={styles.imageUpload}>
      {!isServiceReady ? (
        <div className={styles.notConfigured}>
          <div className={styles.dropZoneIcon}>⚙️</div>
          <Text className={styles.dropZoneText}>
            Configuring Google Drive...
          </Text>
          <Text className={styles.dropZoneSubtext}>
            Please wait while we set up your Google Drive connection
          </Text>
        </div>
      ) : (
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
                  'Drop image files here to upload to Google Drive'}
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
      )}

      {(isUploading || uploading) && (
        <div className={styles.uploadingIndicator}>
          <Text>
            {t('BONSAI.DETAIL.UPLOADING_IMAGES') || 'Uploading images'}...
          </Text>
        </div>
      )}
    </div>
  );
};
