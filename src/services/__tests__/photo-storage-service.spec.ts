import { PhotoStorageService } from '../photo-storage-service';

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock Image constructor
global.Image = jest.fn(() => ({
  onload: jest.fn(),
  onerror: jest.fn(),
  src: '',
  width: 100,
  height: 100,
}));

// Mock Firebase Storage
jest.mock('../../utils/firebase', () => ({
  storage: {
    ref: jest.fn(),
  },
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

describe('PhotoStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadPhoto', () => {
    it('should upload a photo and return metadata', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockBonsaiId = 'test-bonsai-id';
      const mockDownloadURL = 'https://example.com/test.jpg';

      const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

      ref.mockReturnValue({});
      uploadBytes.mockResolvedValue({ ref: {} });
      getDownloadURL.mockResolvedValue(mockDownloadURL);

      const result = await PhotoStorageService.uploadPhoto(
        mockFile,
        mockBonsaiId,
      );

      expect(result).toMatchObject({
        url: mockDownloadURL,
        fileName: 'test.jpg',
        fileSize: 4,
        contentType: 'image/jpeg',
        storagePath: expect.stringContaining('bonsai/test-bonsai-id/'),
      });
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockBonsaiId = 'test-bonsai-id';

      const { uploadBytes } = require('firebase/storage');
      uploadBytes.mockRejectedValue(new Error('Upload failed'));

      await expect(
        PhotoStorageService.uploadPhoto(mockFile, mockBonsaiId),
      ).rejects.toThrow('Failed to upload photo');
    });
  });

  describe('uploadMultiplePhotos', () => {
    it('should upload multiple photos', async () => {
      const mockFiles = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      const mockBonsaiId = 'test-bonsai-id';

      const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

      ref.mockReturnValue({});
      uploadBytes.mockResolvedValue({ ref: {} });
      getDownloadURL.mockResolvedValue('https://example.com/test.jpg');

      const results = await PhotoStorageService.uploadMultiplePhotos(
        mockFiles,
        mockBonsaiId,
      );

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        fileName: 'test1.jpg',
        contentType: 'image/jpeg',
      });
      expect(results[1]).toMatchObject({
        fileName: 'test2.jpg',
        contentType: 'image/jpeg',
      });
    });
  });

  describe('deletePhoto', () => {
    it('should delete a photo from storage', async () => {
      const mockPhotoMetadata = {
        id: 'test-id',
        url: 'https://example.com/test.jpg',
        fileName: 'test.jpg',
        fileSize: 1000,
        contentType: 'image/jpeg',
        uploadedAt: '2023-01-01T00:00:00.000Z',
        storagePath: 'bonsai/test-bonsai-id/123_test.jpg',
      };

      const { ref, deleteObject } = require('firebase/storage');
      ref.mockReturnValue({});
      deleteObject.mockResolvedValue(undefined);

      await PhotoStorageService.deletePhoto(mockPhotoMetadata);

      expect(deleteObject).toHaveBeenCalledWith({});
    });
  });
});
