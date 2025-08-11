import { PhotoMetadata } from '../types/bonsai';

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  issueNumber: number;
}

export class GitHubPhotoService {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';
  private static readonly ISSUE_TITLE_PREFIX = '[BONSAI-PHOTOS]';
  private static readonly ISSUE_BODY_PREFIX = 'Bonsai app photo storage';

  private static config: GitHubConfig | null = null;

  static initialize(config: GitHubConfig) {
    this.config = config;
  }

  private static async uploadToGitHubIssue(
    file: File,
    fileName: string,
  ): Promise<string> {
    if (!this.config) {
      throw new Error('GitHub Photo Service not initialized');
    }

    const { owner, repo, token, issueNumber } = this.config;
    const base64Data = await this.fileToBase64(file);
    const uploadUrl = `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
    const commentBody = `${this.ISSUE_BODY_PREFIX}\n\n![${fileName}](data:${file.type};base64,${base64Data})`;

    console.info('Uploading to GitHub:', {
      url: uploadUrl,
      owner,
      repo,
      issueNumber,
      fileSize: file.size,
      fileName,
    });

    // Upload to GitHub
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        body: commentBody,
      }),
    });

    console.info('GitHub API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API Error:', error);
      throw new Error(`Failed to upload to GitHub: ${error}`);
    }

    const result = await response.json();
    console.info('GitHub API Success:', result);

    // Extract the image URL from the comment
    const imageUrl = this.extractImageUrlFromComment(result.body);

    if (!imageUrl) {
      console.error(
        'Failed to extract image URL from comment body:',
        result.body,
      );
      throw new Error('Failed to extract image URL from GitHub comment');
    }

    return imageUrl;
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private static extractImageUrlFromComment(
    commentBody: string,
  ): string | null {
    // GitHub converts base64 images to their CDN URLs
    // Look for the image URL in the comment body
    const imageMatch = commentBody.match(
      /!\[.*?\]\((https:\/\/.*?\.githubusercontent\.com\/.*?)\)/,
    );
    return imageMatch ? imageMatch[1] : null;
  }

  private static async extractImageMetadata(file: File): Promise<{
    width?: number;
    height?: number;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        resolve({});
      }, 5000);

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

  static async addPhoto(file: File, bonsaiId: string): Promise<PhotoMetadata> {
    try {
      // Validate file
      if (!file || file.size === 0) {
        throw new Error('Invalid file provided');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed.');
      }

      // Check file size (GitHub has limits)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Maximum 10MB allowed.');
      }

      // Upload to GitHub Issue
      const fileName = `${bonsaiId}_${Date.now()}_${file.name}`;
      const imageUrl = await this.uploadToGitHubIssue(file, fileName);

      // Extract image metadata
      const imageMetadata = await this.extractImageMetadata(file);

      // Create photo metadata
      const photoMetadata: PhotoMetadata = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
        source: 'github',
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
      console.error('Error adding photo to GitHub:', error);
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

    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'File size too large. Maximum 10MB allowed.',
      };
    }

    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'Only image files are allowed.' };
    }

    return { isValid: true };
  }

  static isInitialized(): boolean {
    return this.config !== null;
  }
}
