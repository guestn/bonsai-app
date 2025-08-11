export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'jpeg' | 'webp';
  maxFileSize?: number; // in bytes
}

export class CompressedPhotoService {
  private static readonly DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'jpeg',
    maxFileSize: 500 * 1024, // 500KB target
  };

  static async compressImage(
    file: File,
    options: CompressionOptions = {},
  ): Promise<{ blob: Blob; width?: number; height?: number }> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            opts.maxWidth!,
            opts.maxHeight!,
          );

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw and compress the image
          ctx!.drawImage(img, 0, 0, width, height);

          // Convert to blob with specified quality and format
          const mimeType = opts.format === 'webp' ? 'image/webp' : 'image/jpeg';

          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Check if the compressed file is still too large
                if (blob.size > opts.maxFileSize!) {
                  // Try with lower quality
                  const lowerQuality = Math.max(0.1, opts.quality! - 0.2);
                  canvas.toBlob(
                    (lowerBlob) => {
                      if (lowerBlob) {
                        resolve({
                          blob: lowerBlob,
                          width,
                          height,
                        });
                      } else {
                        reject(new Error('Failed to compress image'));
                      }
                    },
                    mimeType,
                    lowerQuality,
                  );
                } else {
                  resolve({
                    blob,
                    width,
                    height,
                  });
                }
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            mimeType,
            opts.quality,
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Load the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  }

  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if image is larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;

      if (width > height) {
        // Landscape image
        width = maxWidth;
        height = width / aspectRatio;
      } else {
        // Portrait image
        height = maxHeight;
        width = height * aspectRatio;
      }

      // Ensure we don't exceed the other dimension
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  static async compressMultipleImages(
    files: File[],
    options: CompressionOptions = {},
  ): Promise<
    { blob: Blob; width?: number; height?: number; originalFile: File }[]
  > {
    const compressionPromises = files.map(async (file) => {
      const result = await this.compressImage(file, options);
      return { ...result, originalFile: file };
    });
    return Promise.all(compressionPromises);
  }

  static getCompressionStats(
    originalFile: File,
    compressedBlob: Blob,
  ): {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    sizeReduction: number;
  } {
    const originalSize = originalFile.size;
    const compressedSize = compressedBlob.size;
    const compressionRatio = compressedSize / originalSize;
    const sizeReduction =
      ((originalSize - compressedSize) / originalSize) * 100;

    return {
      originalSize,
      compressedSize,
      compressionRatio,
      sizeReduction,
    };
  }

  static shouldCompress(file: File, maxSize: number = 1024 * 1024): boolean {
    return file.size > maxSize;
  }

  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () =>
        reject(new Error('Failed to convert blob to base64'));
      reader.readAsDataURL(blob);
    });
  }
}
