import { doc, setDoc, deleteDoc, getDoc, collection } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { PhotoMetadata } from '../types/bonsai';
import { CompressedPhotoService } from './compressed-photo-service';

export class PhotoStorageService {
  private static readonly PHOTOS_COLLECTION = 'photos';
  private static readonly CHUNK_SIZE = 750000; // 750KB chunks for Firestore (safe limit)

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private static async extractImageMetadata(file: File): Promise<{
    width?: number;
    height?: number;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve({});
      }, 5000); // 5 second timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => {
        clearTimeout(timeout);
        resolve({});
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static chunkBase64(base64String: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < base64String.length; i += this.CHUNK_SIZE) {
      chunks.push(base64String.slice(i, i + this.CHUNK_SIZE));
    }
    return chunks;
  }

  static async addPhoto(file: File, bonsaiId: string): Promise<PhotoMetadata> {
    try {
      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file provided');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed.');
      }

      // Compress image to JPEG/WebP for efficient storage
      const compressionResult = await CompressedPhotoService.compressImage(
        file,
        {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          format: 'jpeg',
          maxFileSize: 500 * 1024, // 500KB target
        },
      );

      const compressionStats = CompressedPhotoService.getCompressionStats(
        file,
        compressionResult.blob,
      );
      console.info('Image compressed:', compressionStats);

      // Convert compressed blob to base64
      const base64Data = await CompressedPhotoService.blobToBase64(
        compressionResult.blob,
      );

      // Check if base64 is too large and needs chunking
      const needsChunking = base64Data.length > this.CHUNK_SIZE;
      const chunks = needsChunking
        ? this.chunkBase64(base64Data)
        : [base64Data];

      // Extract image metadata from compression result
      const imageMetadata = {
        width: compressionResult.width,
        height: compressionResult.height,
      };

      // Create photo ID
      const photoId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create photo metadata (without the base64 data)
      const photoMetadata: PhotoMetadata = {
        id: photoId,
        url: `photo://${photoId}`, // Use a custom URL scheme to identify stored photos
        fileName: file.name,
        fileSize: compressionResult.blob.size,
        contentType: compressionResult.blob.type,
        uploadedAt: new Date().toISOString(),
        source: 'stored',
        storagePath: photoId, // Use photoId as storage path
      };

      // Only add width/height if they are defined
      if (imageMetadata.width !== undefined) {
        photoMetadata.width = imageMetadata.width;
      }
      if (imageMetadata.height !== undefined) {
        photoMetadata.height = imageMetadata.height;
      }

      // Store the base64 data in a separate document
      const photoDoc = doc(db, this.PHOTOS_COLLECTION, photoId);

      if (needsChunking) {
        // Store chunks in separate fields
        const chunkData: any = {
          bonsaiId,
          uploadedAt: photoMetadata.uploadedAt,
          isChunked: true,
          totalChunks: chunks.length,
        };

        // Add each chunk as a separate field
        chunks.forEach((chunk, index) => {
          chunkData[`chunk_${index}`] = chunk;
        });

        await setDoc(photoDoc, chunkData);
      } else {
        // Store as single field
        await setDoc(photoDoc, {
          bonsaiId,
          base64Data,
          uploadedAt: photoMetadata.uploadedAt,
          isChunked: false,
        });
      }

      return photoMetadata;
    } catch (error: any) {
      console.error('Error adding photo:', error);
      throw error;
    }
  }

  static async addMultiplePhotos(
    files: File[],
    bonsaiId: string,
  ): Promise<PhotoMetadata[]> {
    const photoPromises = files.map((file) => this.addPhoto(file, bonsaiId));
    return Promise.all(photoPromises);
  }

  static async getPhotoData(photoId: string): Promise<string | null> {
    try {
      const photoDoc = doc(db, this.PHOTOS_COLLECTION, photoId);
      const photoSnapshot = await getDoc(photoDoc);

      if (photoSnapshot.exists()) {
        const data = photoSnapshot.data();

        if (data?.isChunked) {
          // Reconstruct from chunks
          const chunks: string[] = [];
          for (let i = 0; i < data.totalChunks; i++) {
            const chunk = data[`chunk_${i}`];
            if (chunk) {
              chunks.push(chunk);
            }
          }
          return chunks.join('');
        } else {
          // Single field
          return data?.base64Data || null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting photo data:', error);
      return null;
    }
  }

  static async deletePhoto(photoMetadata: PhotoMetadata): Promise<void> {
    try {
      if (photoMetadata.source === 'stored' && photoMetadata.storagePath) {
        const photoDoc = doc(
          db,
          this.PHOTOS_COLLECTION,
          photoMetadata.storagePath,
        );
        await deleteDoc(photoDoc);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error('Failed to delete photo');
    }
  }

  static async deleteMultiplePhotos(
    photosMetadata: PhotoMetadata[],
  ): Promise<void> {
    const deletePromises = photosMetadata.map((photo) =>
      this.deletePhoto(photo),
    );
    await Promise.all(deletePromises);
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file || file.size === 0) {
      return { isValid: false, error: 'Invalid file provided' };
    }

    if (file.size > 20 * 1024 * 1024) {
      return {
        isValid: false,
        error:
          'File size too large. Maximum 20MB allowed (will be compressed to ~500KB).',
      };
    }

    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Only image files are allowed.' };
    }

    return { isValid: true };
  }
}
