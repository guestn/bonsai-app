export interface BonsaiEvent {
  id: string;
  description: string;
  date: string;
  value?: number;
  cost?: number;
}

export interface PhotoMetadata {
  id: string;
  url: string; // External image URL or Firebase Storage URL
  fileName?: string; // Optional original filename
  fileSize?: number; // Optional file size in bytes
  contentType?: string; // Optional MIME type
  uploadedAt: string; // ISO timestamp
  takenAt?: string; // Optional EXIF date taken
  width?: number; // Image width in pixels
  height?: number; // Image height in pixels
  source?:
    | 'external'
    | 'uploaded'
    | 'base64'
    | 'stored'
    | 'github'
    | 'google-drive'; // Track if it's an external URL, uploaded, base64, stored, github, or google-drive
  storagePath?: string; // Firebase Storage path (for uploaded photos)
}

export interface BonsaiTree {
  id: string;
  name: string;
  species: string;
  initialCost: number;
  acquisitionDate: string;
  events: BonsaiEvent[];
  photos?: PhotoMetadata[];
  notes?: string;
  status: 'active' | 'expired';
  type: 'purchased' | 'collected' | 'field';
  location?: string;
  potType?: string;
  age?: number;
}

export interface BonsaiFilters {
  search: string;
  status: string;
  type: string;
  species: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface BonsaiSortOptions {
  field:
    | 'name'
    | 'species'
    | 'acquisitionDate'
    | 'status'
    | 'type'
    | 'initialCost';
  direction: 'asc' | 'desc';
}
