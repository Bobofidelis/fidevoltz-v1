import { prisma } from '@/lib/prisma';
import { CloudinaryAdapter } from './providers/cloudinary';
import {
  MediaProviderAdapter,
  MediaUploadResult,
  UploadOptions,
  CloudinaryConfig,
} from './types';

/**
 * Main uploader service that routes uploads to the active provider
 */
export class MediaUploader {
  private static instance: MediaUploader;
  private adapter: MediaProviderAdapter | null = null;
  private provider: string | null = null;

  private constructor() {}

  static getInstance(): MediaUploader {
    if (!MediaUploader.instance) {
      MediaUploader.instance = new MediaUploader();
    }
    return MediaUploader.instance;
  }

  /**
   * Initialize the uploader with the active provider from database
   */
  async initialize(): Promise<void> {
    try {
      // Get active provider config from database
      const activeConfig = await prisma.mediaProviderConfig.findFirst({
        where: { isActive: true },
      });

      if (!activeConfig) {
        console.warn('[MediaUploader] No active provider configured');
        this.adapter = null;
        this.provider = null;
        return;
      }

      // Initialize the appropriate adapter
      switch (activeConfig.provider) {
        case 'CLOUDINARY':
          this.adapter = new CloudinaryAdapter(activeConfig.config as unknown as CloudinaryConfig);
          this.provider = 'CLOUDINARY';
          console.log('[MediaUploader] Initialized with Cloudinary provider');
          break;

        case 'AWS_S3':
          // TODO: Implement S3 adapter
          throw new Error('AWS S3 provider not yet implemented');

        case 'LOCAL':
          // TODO: Implement local storage adapter
          throw new Error('Local storage provider not yet implemented');

        default:
          throw new Error(`Unknown provider: ${activeConfig.provider}`);
      }
    } catch (error) {
      console.error('[MediaUploader] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Upload a file to the active provider
   */
  async upload(
    file: File | Buffer,
    options?: UploadOptions
  ): Promise<MediaUploadResult> {
    if (!this.adapter) {
      await this.initialize();
      if (!this.adapter) {
        throw new Error('No media provider configured. Please configure a provider in settings.');
      }
    }

    try {
      console.log('[MediaUploader] Uploading file...', {
        provider: this.provider,
        type: options?.type,
        folder: options?.folder,
      });

      const result = await this.adapter.upload(file, options);
      
      console.log('[MediaUploader] Upload successful:', {
        publicId: result.publicId,
        url: result.url,
      });

      return result;
    } catch (error) {
      console.error('[MediaUploader] Upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from the active provider
   */
  async delete(publicId: string): Promise<boolean> {
    if (!this.adapter) {
      await this.initialize();
      if (!this.adapter) {
        throw new Error('No media provider configured');
      }
    }

    try {
      console.log('[MediaUploader] Deleting file:', publicId);
      const result = await this.adapter.delete(publicId);
      console.log('[MediaUploader] Delete result:', result);
      return result;
    } catch (error) {
      console.error('[MediaUploader] Delete error:', error);
      return false;
    }
  }

  /**
   * Get URL for a media file
   */
  getUrl(publicId: string, options?: any): string {
    if (!this.adapter) {
      throw new Error('No media provider configured');
    }
    return this.adapter.getUrl(publicId, options);
  }

  /**
   * Check if a provider is configured
   */
  isConfigured(): boolean {
    return this.adapter !== null;
  }

  /**
   * Get the current provider name
   */
  getProvider(): string | null {
    return this.provider;
  }

  /**
   * Force re-initialization (useful after config changes)
   */
  async reinitialize(): Promise<void> {
    this.adapter = null;
    this.provider = null;
    await this.initialize();
  }
}

// Export singleton instance
export const mediaUploader = MediaUploader.getInstance();
