import { PhotoMetadata } from '../types/bonsai';

export class Base64PhotoService {
  private static readonly CHUNK_SIZE = 1000000; // 1MB chunks for Firestore

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

      // Check file size (base64 increases size by ~33%, so limit to ~3MB for ~4MB base64)
      if (file.size > 3 * 1024 * 1024) {
        throw new Error(
          'File size too large. Maximum 3MB allowed for base64 storage.',
        );
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed.');
      }

      // Convert to base64
      const base64Data = await this.fileToBase64(file);

      // Check if base64 is too large for Firestore (max ~1MB per field)
      if (base64Data.length > this.CHUNK_SIZE) {
        throw new Error(
          'Image too large for storage. Please use a smaller image or external URL.',
        );
      }

      // Extract image metadata
      const imageMetadata = await this.extractImageMetadata(file);

      // Create photo metadata
      const photoMetadata: PhotoMetadata = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: base64Data, // Store base64 as URL
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
        source: 'base64',
      };

      // Only add width/height if they are defined
      if (imageMetadata.width !== undefined) {
        photoMetadata.width = imageMetadata.width;
      }
      if (imageMetadata.height !== undefined) {
        photoMetadata.height = imageMetadata.height;
      }

      return photoMetadata;
    } catch (error: any) {
      console.error('Error adding base64 photo:', error);
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

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file || file.size === 0) {
      return { isValid: false, error: 'Invalid file provided' };
    }

    if (file.size > 3 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'File size too large. Maximum 3MB allowed.',
      };
    }

    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Only image files are allowed.' };
    }

    return { isValid: true };
  }
}
