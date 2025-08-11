import { FC, useState, useEffect } from 'react';
import { PhotoMetadata } from '../../../types/bonsai';
import { PhotoStorageService } from '../../../services/photo-storage-service';

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

        if (photo.source === 'stored' && photo.url.startsWith('photo://')) {
          // Load base64 data from Firestore
          const photoId = photo.url.replace('photo://', '');
          const base64Data = await PhotoStorageService.getPhotoData(photoId);

          if (base64Data) {
            setImageSrc(base64Data);
          } else {
            setError('Failed to load image data');
          }
        } else {
          // External URL - use directly
          setImageSrc(photo.url);
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

  return <img src={imageSrc} alt={alt} className={className} loading="lazy" />;
};
