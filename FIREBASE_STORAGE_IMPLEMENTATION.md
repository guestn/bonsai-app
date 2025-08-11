# Firebase Storage Implementation for Bonsai Photos

## Overview

This implementation adds Firebase Storage support for storing bonsai photos, with metadata stored in Firestore. This provides better scalability, cost efficiency, and data management compared to storing base64 images directly in the database.

## Architecture

### Photo Storage Flow

1. **Upload**: Photos are uploaded to Firebase Storage in the path `bonsai/{bonsaiId}/{timestamp}_{filename}`
2. **Metadata Extraction**: Image metadata (dimensions, file size, etc.) is extracted during upload
3. **Database Storage**: Photo metadata is stored in the Firestore document, not the actual image data
4. **Retrieval**: Images are served via Firebase Storage URLs

### Data Structure

#### PhotoMetadata Interface
```typescript
interface PhotoMetadata {
  id: string;
  url: string;           // Firebase Storage download URL
  fileName: string;      // Original filename
  fileSize: number;      // File size in bytes
  contentType: string;   // MIME type (e.g., 'image/jpeg')
  uploadedAt: string;    // ISO timestamp
  takenAt?: string;      // Optional EXIF date taken
  width?: number;        // Image width in pixels
  height?: number;       // Image height in pixels
  storagePath: string;   // Firebase Storage path
}
```

#### Updated BonsaiTree Interface
```typescript
interface BonsaiTree {
  // ... existing fields
  photos?: PhotoMetadata[];  // Replaces the old 'images?: string[]'
}
```

## Services

### PhotoStorageService

Located at `src/services/photo-storage-service.ts`

**Key Methods:**
- `uploadPhoto(file, bonsaiId)`: Uploads a single photo and returns metadata
- `uploadMultiplePhotos(files, bonsaiId)`: Uploads multiple photos
- `deletePhoto(photoMetadata)`: Deletes a photo from storage
- `deleteMultiplePhotos(photosMetadata)`: Deletes multiple photos

### Updated BonsaiService

Located at `src/services/bonsai-service.ts`

**New Methods:**
- `addPhotos(bonsaiId, files)`: Uploads photos and updates the bonsai tree
- `deletePhotos(bonsaiId, photoIds)`: Deletes specific photos
- `deleteBonsaiWithPhotos(id)`: Deletes a bonsai tree and all its photos

## Components

### Updated ImageUpload Component

The `ImageUpload` component now:
- Takes a `bonsaiId` prop instead of just handling file conversion
- Uses `BonsaiService.addPhotos()` to upload to Firebase Storage
- Returns `PhotoMetadata[]` instead of `string[]`
- Handles upload state internally

### Updated BonsaiDetail Component

The bonsai detail view now:
- Displays photos using their Firebase Storage URLs
- Uses photo metadata for better image handling
- Supports photo deletion with cleanup

## Benefits

1. **Cost Efficiency**: Firebase Storage is much cheaper than storing base64 in Firestore
2. **Performance**: Faster loading times with CDN-backed storage
3. **Scalability**: Better handling of large images and high traffic
4. **Metadata**: Rich photo information (dimensions, file size, upload date)
5. **Cleanup**: Automatic cleanup when bonsai trees are deleted
6. **Security**: Firebase Storage provides built-in security rules

## Migration

### From Base64 to Firebase Storage

The implementation includes backward compatibility:
- Old `images` field is replaced with `photos` field
- Existing base64 images will continue to work
- New uploads use Firebase Storage
- Gradual migration path available

### Database Schema Changes

```typescript
// Old structure
{
  images: string[]  // Base64 encoded images
}

// New structure
{
  photos: PhotoMetadata[]  // Metadata objects with Firebase Storage URLs
}
```

## Configuration

### Firebase Storage Rules

Ensure your Firebase Storage rules allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /bonsai/{bonsaiId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid != null;
    }
  }
}
```

### Environment Variables

Make sure these are set in your `.env` file:
```
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

## Testing

Tests are available at `src/services/__tests__/photo-storage-service.spec.ts` covering:
- Photo upload functionality
- Error handling
- Multiple photo uploads
- Photo deletion

## Usage Example

```typescript
// Upload photos to a bonsai tree
const files = [file1, file2, file3];
const photoMetadata = await BonsaiService.addPhotos(bonsaiId, files);

// Delete specific photos
await BonsaiService.deletePhotos(bonsaiId, ['photo1-id', 'photo2-id']);

// Delete bonsai tree and all its photos
await BonsaiService.deleteBonsaiWithPhotos(bonsaiId);
```

## Future Enhancements

1. **Image Optimization**: Automatic resizing and compression
2. **EXIF Data**: Extract and store camera information
3. **Thumbnail Generation**: Create thumbnails for faster loading
4. **Batch Operations**: Bulk upload/delete operations
5. **Image Search**: Metadata-based photo search
6. **Versioning**: Photo version history 