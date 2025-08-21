import { FC, useState, useEffect } from 'react';
import { PhotoMetadata } from '../../../types/bonsai';
import { GoogleDrivePhotoService } from '../../../services/google-drive-photo-service';

interface PhotoDisplayProps {
  photo: PhotoMetadata;
  alt: string;
  className?: string;
}

export const PhotoDisplay: FC<PhotoDisplayProps> = ({
  photo,
  alt,
  className,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError('');

        console.info('Photo source:', photo.source);
        console.info('Photo ID:', photo.id);
        console.info('Photo URL:', photo.url);

        if (photo.source === 'google-drive') {
          console.info('✅ Processing Google Drive photo');
          // For Google Drive photos, get the working URL dynamically
          try {
            const workingUrl = await GoogleDrivePhotoService.getDirectPhotoUrl(
              photo.id,
            );
            console.info('✅ Got working URL:', workingUrl);
            console.info('🔍 Setting image source to:', workingUrl);
            setImageSrc(workingUrl);
          } catch (error) {
            console.error('Failed to get working photo URL:', error);
            // Fallback to the stored URL
            console.warn('⚠️ Falling back to stored URL:', photo.url);
            setImageSrc(photo.url);
          }
        } else {
          console.info('⚠️ Photo source is not google-drive, using stored URL');
          // Check if the URL looks like Google Drive anyway
          if (
            photo.url &&
            (photo.url.includes('drive.google.com') ||
              photo.url.includes('googleusercontent.com'))
          ) {
            console.info(
              '🔍 URL looks like Google Drive, trying to get working URL anyway',
            );
            try {
              const workingUrl =
                await GoogleDrivePhotoService.getDirectPhotoUrl(photo.id);
              console.info(
                '✅ Got working URL for Google Drive-like photo:',
                workingUrl,
              );
              setImageSrc(workingUrl);
            } catch (error) {
              console.warn('⚠️ Could not get working URL, using stored URL');
              setImageSrc(photo.url);
            }
          } else {
            setImageSrc(photo.url);
          }
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError('Failed to load image');
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [photo]);

  if (isLoading) {
    return (
      <div className={`${className} photo-loading`}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} photo-error`}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  console.info('🎯 Final image src being rendered:', imageSrc);
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
      key={imageSrc} // Force re-render when URL changes
    />
  );
};
