import { ExternalPhotoService } from '../external-photo-service';

// Mock Image constructor
global.Image = jest.fn(() => {
  const img = {
    onload: jest.fn(),
    onerror: jest.fn(),
    src: '',
    width: 100,
    height: 100,
  };

  // Simulate successful image load
  setTimeout(() => {
    if (img.onload) img.onload();
  }, 10);

  return img;
});

describe('ExternalPhotoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(
        ExternalPhotoService.validateUrl('https://example.com/image.jpg'),
      ).toBe(true);
      expect(
        ExternalPhotoService.validateUrl('http://example.com/image.png'),
      ).toBe(true);
      expect(
        ExternalPhotoService.validateUrl(
          'https://images.unsplash.com/photo.jpg',
        ),
      ).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(ExternalPhotoService.validateUrl('not-a-url')).toBe(false);
      expect(
        ExternalPhotoService.validateUrl('ftp://example.com/image.jpg'),
      ).toBe(false);
      expect(ExternalPhotoService.validateUrl('')).toBe(false);
      expect(ExternalPhotoService.validateUrl('https://')).toBe(false);
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from URLs', () => {
      expect(
        ExternalPhotoService.extractDomain('https://example.com/image.jpg'),
      ).toBe('example.com');
      expect(
        ExternalPhotoService.extractDomain(
          'http://images.unsplash.com/photo.jpg',
        ),
      ).toBe('images.unsplash.com');
    });

    it('should return unknown for invalid URLs', () => {
      expect(ExternalPhotoService.extractDomain('not-a-url')).toBe('unknown');
    });
  });

  describe('addExternalPhoto', () => {
    it('should add external photo with metadata', async () => {
      const mockUrl = 'https://example.com/image.jpg';
      const mockBonsaiId = 'test-bonsai-id';

      const result = await ExternalPhotoService.addExternalPhoto(
        mockUrl,
        mockBonsaiId,
      );

      expect(result).toMatchObject({
        url: mockUrl,
        source: 'external',
        width: 100,
        height: 100,
      });
      expect(result.id).toBeDefined();
      expect(result.uploadedAt).toBeDefined();
    });

    it('should handle invalid URLs', async () => {
      const invalidUrl = 'not-a-url';
      const mockBonsaiId = 'test-bonsai-id';

      await expect(
        ExternalPhotoService.addExternalPhoto(invalidUrl, mockBonsaiId),
      ).rejects.toThrow('Invalid URL provided');
    });

    it('should handle empty URLs', async () => {
      const emptyUrl = '';
      const mockBonsaiId = 'test-bonsai-id';

      await expect(
        ExternalPhotoService.addExternalPhoto(emptyUrl, mockBonsaiId),
      ).rejects.toThrow('Invalid URL provided');
    });
  });

  describe('addMultipleExternalPhotos', () => {
    it('should add multiple external photos', async () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.png',
      ];
      const mockBonsaiId = 'test-bonsai-id';

      const results = await ExternalPhotoService.addMultipleExternalPhotos(
        urls,
        mockBonsaiId,
      );

      expect(results).toHaveLength(2);
      expect(results[0].url).toBe(urls[0]);
      expect(results[1].url).toBe(urls[1]);
      expect(results[0].source).toBe('external');
      expect(results[1].source).toBe('external');
    });
  });
});
