export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxFileSize?: number; // in bytes
}

export class ImageCompressionService {
  private static readonly DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    maxFileSize: 1024 * 1024, // 1MB
  };

  static async compressImage(
    file: File,
    options: CompressionOptions = {},
  ): Promise<File> {
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

          // Convert to blob with specified quality
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
                        const compressedFile = new File(
                          [lowerBlob],
                          file.name,
                          {
                            type: file.type,
                            lastModified: Date.now(),
                          },
                        );
                        resolve(compressedFile);
                      } else {
                        reject(new Error('Failed to compress image'));
                      }
                    },
                    file.type,
                    lowerQuality,
                  );
                } else {
                  const compressedFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                }
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            file.type,
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
  ): Promise<File[]> {
    const compressionPromises = files.map((file) =>
      this.compressImage(file, options),
    );
    return Promise.all(compressionPromises);
  }

  static getCompressionStats(
    originalFile: File,
    compressedFile: File,
  ): {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    sizeReduction: number;
  } {
    const originalSize = originalFile.size;
    const compressedSize = compressedFile.size;
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
}
