import { PhotoMetadata } from '../types/bonsai';

interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  folderId: string;
}

interface UploadResponse {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
  size: string;
}

export class GoogleDrivePhotoService {
  private static config: GoogleDriveConfig | null = null;
  private static accessToken: string | null = null;
  private static gapi: any = null;

  static async initialize(config?: GoogleDriveConfig) {
    // If no config provided, try to load from environment variables
    if (!config) {
      const envConfig = this.loadFromEnvironment();
      if (envConfig) {
        this.config = envConfig;
      } else {
        throw new Error(
          'Google Drive configuration not found in environment variables',
        );
      }
    } else {
      this.config = config;
    }

    await this.loadGoogleAPI();
  }

  private static loadFromEnvironment(): GoogleDriveConfig | null {
    const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const folderId = import.meta.env.VITE_PHOTO_FOLDER_ID;

    console.info('Environment variables check:', {
      apiKey: apiKey ? '✅ Found' : '❌ Missing',
      clientId: clientId ? '✅ Found' : '❌ Missing',
      folderId: folderId ? '✅ Found' : '❌ Missing',
      allVars: import.meta.env,
    });

    if (apiKey && clientId && folderId) {
      return {
        apiKey,
        clientId,
        folderId,
      };
    }

    return null;
  }

  private static loadGoogleAPI() {
    if (typeof window === 'undefined') return;

    return new Promise<void>((resolve) => {
      // For now, we'll use the popup OAuth flow
      // No need to load additional scripts
      resolve();
    });
  }

  static async authenticate(): Promise<boolean> {
    try {
      console.info('Starting Google Drive authentication...');

      // Check if we already have a valid token
      if (this.accessToken) {
        console.info('✅ Already have access token');
        return true;
      }

      // Check if we have a token in sessionStorage (from OAuth callback)
      const storedToken = sessionStorage.getItem('google_drive_token');
      const storedState = sessionStorage.getItem('google_drive_state');

      if (storedToken && storedState === 'google-drive-auth') {
        console.info('✅ Found access token in sessionStorage');
        this.accessToken = storedToken;

        // Clean up sessionStorage
        sessionStorage.removeItem('google_drive_token');
        sessionStorage.removeItem('google_drive_state');

        return true;
      }

      // Check if we're returning from OAuth (look for token in URL hash)
      const fragment = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(fragment);

      const accessToken = hashParams.get('access_token');
      const state = hashParams.get('state');

      if (accessToken && state === 'google-drive-auth') {
        console.info('✅ Found access token in URL hash');
        console.info('Token length:', accessToken.length);
        console.info('Token preview:', accessToken.substring(0, 20) + '...');
        this.accessToken = accessToken;

        // Clean up the URL hash
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        return true;
      }

      console.info('Building OAuth URL...');
      // Redirect to Google OAuth
      const currentPage = window.location.pathname + window.location.search;
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${this.config?.clientId}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.file')}&` +
        `response_type=token&` +
        `state=${encodeURIComponent(`google-drive-auth:${currentPage}`)}`;

      console.info('Redirecting to OAuth...');
      console.info('OAuth URL:', authUrl);

      // Redirect the current page to Google OAuth
      window.location.href = authUrl;

      // This will never execute due to redirect, but return false just in case
      return false;
    } catch (error) {
      console.error('Google Drive authentication failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        config: this.config ? '✅ Loaded' : '❌ Missing',
        clientId: this.config?.clientId ? '✅ Set' : '❌ Missing',
      });
      return false;
    }
  }

  static async uploadPhoto(
    file: File,
    metadata: Partial<PhotoMetadata>,
  ): Promise<PhotoMetadata> {
    console.info('Starting photo upload...');
    console.info('Config loaded:', !!this.config);
    console.info(
      'Access token:',
      this.accessToken ? '✅ Present' : '❌ Missing',
    );
    console.info('Token length:', this.accessToken?.length || 0);

    if (!this.config || !this.accessToken) {
      throw new Error('Google Drive not configured or not authenticated');
    }

    try {
      // Create file metadata
      const fileMetadata = {
        name: file.name,
        parents: [this.config.folderId],
        mimeType: file.type,
      };

      // Upload file
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: this.createMultipartBody(fileMetadata, file),
        },
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: UploadResponse = await response.json();

      // Note: We'll skip making files public for now due to CORS restrictions
      // Instead, we'll use authenticated URLs in the photo display
      console.info(
        'File uploaded successfully. Using authenticated access for viewing.',
      );

      // Try to make file public (but don't fail if it doesn't work)
      try {
        await this.makeFilePublic(result.id);
      } catch (error) {
        console.warn(
          'Could not make file public (this is expected in browser):',
          error,
        );
        console.info('Will use authenticated URLs instead');
      }

      // Return photo metadata
      return {
        id: result.id,
        url: `https://drive.google.com/uc?export=view&id=${result.id}`,
        fileName: result.name,
        fileSize: parseInt(result.size),
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
        takenAt: metadata.takenAt || new Date().toISOString(),
        width: metadata.width,
        height: metadata.height,
        source: 'google-drive',
      };
    } catch (error) {
      console.error('Photo upload failed:', error);
      throw error;
    }
  }

  private static createMultipartBody(metadata: any, file: File): FormData {
    const boundary =
      '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const formData = new FormData();

    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    );
    formData.append('file', file);

    return formData;
  }

  private static async makeFilePublic(fileId: string): Promise<void> {
    if (!this.accessToken) {
      console.warn('No access token available to make file public');
      return;
    }

    try {
      console.info('Making file public:', fileId);
      console.info('Access token length:', this.accessToken.length);
      console.info(
        'Access token preview:',
        this.accessToken.substring(0, 20) + '...',
      );

      const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
      const body = JSON.stringify({
        role: 'reader',
        type: 'anyone',
      });

      console.info('Making request to:', url);
      console.info('Request body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          'Failed to make file public:',
          response.status,
          errorText,
        );
        throw new Error(
          `Failed to make file public: ${response.status} ${errorText}`,
        );
      }

      console.info('✅ File made public successfully');

      // Now publish the file to make it accessible via direct URLs
      const publishResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/publish`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (publishResponse.ok) {
        console.info('✅ File published successfully');
      } else {
        console.warn('⚠️ File permission set but publishing failed');
      }

      // Verify the permission was set by checking the file
      const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=permissions`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        console.info('File permissions:', fileData.permissions);
      }
    } catch (error) {
      console.error('Failed to make file public:', error);
      throw error; // Re-throw to handle in upload method
    }
  }

  static async deletePhoto(photoId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${photoId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Photo deletion failed:', error);
      throw error;
    }
  }

  static getPhotoUrl(photoId: string): string {
    // Return a placeholder - we'll get the actual URL dynamically
    return `https://drive.google.com/file/d/${photoId}`;
  }

  static getThumbnailUrl(photoId: string): string {
    // Use a larger thumbnail for better quality
    return `https://drive.google.com/thumbnail?id=${photoId}&sz=w400`;
  }

  // Get a direct download URL with authentication
  static async getDirectPhotoUrl(photoId: string): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      console.info('Getting direct photo URL for:', photoId);

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${photoId}?fields=webContentLink,webViewLink`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.info('Google Drive file data:', data);

        // Try webContentLink first (direct download)
        if (data.webContentLink) {
          console.info('✅ Using webContentLink:', data.webContentLink);
          return data.webContentLink;
        }

        // Fallback to webViewLink (viewer)
        if (data.webViewLink) {
          console.info('✅ Using webViewLink:', data.webViewLink);
          return data.webViewLink;
        }
      } else {
        console.error(
          'Failed to get file info:',
          response.status,
          response.statusText,
        );
      }
    } catch (error) {
      console.error('Failed to get direct photo URL:', error);
    }

    // Final fallback
    console.warn('Using fallback URL for photo:', photoId);
    return this.getPhotoUrl(photoId);
  }

  static isConfigured(): boolean {
    return this.config !== null;
  }

  // Migration function to update existing photo URLs
  static async migratePhotoUrls(): Promise<void> {
    if (!this.accessToken) {
      console.warn('No access token available for migration');
      return;
    }

    try {
      console.info('Starting photo URL migration...');

      // Get all files in the configured folder
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${this.config?.folderId}'+in+parents&fields=files(id,name,webViewLink)`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.info(`Found ${data.files.length} files to migrate`);

        // Update each file's permissions to ensure they're public
        for (const file of data.files) {
          try {
            await this.makeFilePublic(file.id);
            console.info(`✅ Made file public: ${file.name}`);
          } catch (error) {
            console.warn(`⚠️ Could not make file public: ${file.name}`, error);
          }
        }
      }

      console.info('Photo URL migration completed');
    } catch (error) {
      console.error('Photo URL migration failed:', error);
    }
  }

  static async ensureConfigured(): Promise<boolean> {
    if (this.config !== null) return true;

    // Try to auto-configure from environment
    try {
      const envConfig = this.loadFromEnvironment();
      if (envConfig) {
        await this.initialize(); // This will set this.config
        return true;
      }
    } catch (error) {
      console.warn(
        'Failed to auto-configure Google Drive from environment:',
        error,
      );
    }

    return false;
  }

  // Check for OAuth tokens in sessionStorage (set by global extractor)
  static checkForOAuthToken(): boolean {
    console.info('🔍 Checking for OAuth token in sessionStorage...');

    if (this.accessToken) {
      console.info('✅ Already have access token in memory');
      return true;
    }

    // Check if we have a token in sessionStorage
    const storedToken = sessionStorage.getItem('google_drive_access_token');
    if (storedToken) {
      console.info('✅ Found access token in sessionStorage');
      this.accessToken = storedToken;
      return true;
    }

    console.info('❌ No OAuth token found in sessionStorage');
    return false;
  }

  static isAuthenticated(): boolean {
    // First check if we already have a token
    if (this.accessToken !== null) {
      return true;
    }

    // Check if we have a token in sessionStorage
    const storedToken = sessionStorage.getItem('google_drive_access_token');
    console.info('🔍 Checking sessionStorage for token:', !!storedToken);
    console.info('SessionStorage keys:', Object.keys(sessionStorage));

    if (storedToken) {
      console.info('✅ Found access token in sessionStorage');
      this.accessToken = storedToken;
      return true;
    }

    // If not, check if we're returning from OAuth
    return this.checkForOAuthToken();
  }
}

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi: any;
  }
}
