import { PhotoMetadata } from '../types/bonsai';

export class ExternalPhotoService {
  private static async extractImageMetadata(url: string): Promise<{
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
      img.src = url;
    });
  }

  static async addExternalPhoto(
    url: string,
    bonsaiId: string,
  ): Promise<PhotoMetadata> {
    try {
      // Validate URL
      if (!url || !url.startsWith('http')) {
        throw new Error('Invalid URL provided');
      }

      // Extract image metadata
      const imageMetadata = await this.extractImageMetadata(url);

      // Create photo metadata
      const photoMetadata: PhotoMetadata = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url,
        uploadedAt: new Date().toISOString(),
        source: 'external',
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
      console.error('Error adding external photo:', error);
      if (error.message === 'Invalid URL provided') {
        throw error;
      }
      throw new Error('Failed to add external photo');
    }
  }

  static async addMultipleExternalPhotos(
    urls: string[],
    bonsaiId: string,
  ): Promise<PhotoMetadata[]> {
    const photoPromises = urls.map((url) =>
      this.addExternalPhoto(url, bonsaiId),
    );
    return Promise.all(photoPromises);
  }

  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }
}
