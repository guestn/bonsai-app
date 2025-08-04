import { getAuth } from 'firebase/auth';
import { env } from '../utils/env';

const GOOGLE_PHOTOS_API_BASE = 'https://photoslibrary.googleapis.com/v1';

export interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
  mediaMetadata: {
    width: string;
    height: string;
    creationTime: string;
  };
}

export interface GooglePhotosResponse {
  mediaItems: GooglePhoto[];
  nextPageToken?: string;
}

class GooglePhotosService {
  private async waitForGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50; // 5 seconds
      let attempts = 0;

      const check = () => {
        attempts++;
        if (
          typeof window !== 'undefined' &&
          (window as any).google?.accounts?.oauth2
        ) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Google Identity Services failed to load'));
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }

  private async getAccessToken(): Promise<string> {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Check if Google Client ID is configured
      console.info('Google Client ID:', env.VITE_GOOGLE_CLIENT_ID); // Debug log
      if (!env.VITE_GOOGLE_CLIENT_ID) {
        throw new Error(
          'Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.',
        );
      }

      // Try to get token from Firebase user's Google provider
      const providerData = user.providerData.find(
        (provider) => provider.providerId === 'google.com',
      );

      if (providerData) {
        console.info('User is signed in with Google provider');
      }

      // Use Google Identity Services to get a token with the correct scope
      await this.waitForGoogleIdentityServices();

      // Use Google Identity Services to get a token with the correct scope
      return new Promise((resolve, reject) => {
        console.info(
          'Creating token client with scope:',
          'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/photoslibrary',
        );
        const tokenClient = new (
          window as any
        ).google.accounts.oauth2.TokenClient({
          client_id: env.VITE_GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
          callback: (tokenResponse: any) => {
            console.info('Token client callback received:', tokenResponse);
            if (tokenResponse.error) {
              console.error('Token client error:', tokenResponse);
              reject(new Error(tokenResponse.error));
            } else {
              console.info('Token received successfully');
              console.info('Token scope:', tokenResponse.scope);
              resolve(tokenResponse.access_token);
            }
          },
        });

        console.info('Requesting access token...');
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('Error getting Google Photos access token:', error);
      throw new Error(
        'Unable to access Google Photos. Please ensure you have the required permissions.',
      );
    }
  }

  async getPhotos(pageToken?: string): Promise<GooglePhotosResponse> {
    try {
      const accessToken = await this.getAccessToken();
      console.info('Got access token, making API request...');

      // First, let's test if the API is accessible
      const testUrl =
        'https://photoslibrary.googleapis.com/$discovery/rest?version=v1';
      console.info('Testing API accessibility...');

      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.info('API test response status:', testResponse.status);
      if (!testResponse.ok) {
        const testErrorText = await testResponse.text();
        console.error('API test error:', testErrorText);
      }

      // Try the albums endpoint first to test basic access
      const albumsUrl = `${GOOGLE_PHOTOS_API_BASE}/albums`;
      console.info('Testing albums endpoint...');

      const albumsResponse = await fetch(albumsUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.info('Albums response status:', albumsResponse.status);
      if (!albumsResponse.ok) {
        const albumsErrorText = await albumsResponse.text();
        console.error('Albums error:', albumsErrorText);
      } else {
        const albumsData = await albumsResponse.json();
        console.info('Albums data:', albumsData);
      }

      // Use the search endpoint instead of direct mediaItems
      const searchUrl = `${GOOGLE_PHOTOS_API_BASE}/mediaItems:search`;
      console.info('Making search request to:', searchUrl);
      console.info('Using access token:', accessToken.substring(0, 20) + '...');

      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          pageSize: 25,
          pageToken: pageToken || undefined,
          filters: {
            mediaTypeFilter: {
              mediaTypes: ['PHOTO'],
            },
          },
        }),
      });

      console.info('Response status:', response.status);
      console.info(
        'Response headers:',
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Photos API error response:', errorText);
        throw new Error(`Google Photos API error: ${response.status}`);
      }

      const data = await response.json();
      console.info('Successfully received data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching Google Photos:', error);
      throw error;
    }
  }

  async searchPhotos(
    _query: string,
    pageToken?: string,
  ): Promise<GooglePhotosResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${GOOGLE_PHOTOS_API_BASE}/mediaItems:search`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageSize: 100,
            pageToken,
            filters: {
              mediaTypeFilter: {
                mediaTypes: ['PHOTO'],
              },
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Photos API error response:', errorText);
        throw new Error(`Google Photos API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching Google Photos:', error);
      throw error;
    }
  }

  getPhotoUrl(photo: GooglePhoto, width = 800): string {
    return `${photo.baseUrl}=w${width}-h${Math.round(width * 0.75)}-c`;
  }
}

export const googlePhotosService = new GooglePhotosService();
