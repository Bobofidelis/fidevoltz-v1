import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import {
  MediaUploadResult,
  CloudinaryConfig,
  MediaProviderAdapter,
  UploadOptions,
  TransformOptions,
  MediaType,
} from '../types';

export class CloudinaryAdapter implements MediaProviderAdapter {
  private config: CloudinaryConfig;

  constructor(config: CloudinaryConfig) {
    this.config = config;
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
  }

  async upload(
    file: File | Buffer,
    options?: UploadOptions
  ): Promise<MediaUploadResult> {
    try {
      // Convert File to Buffer if needed
      let buffer: Buffer;
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = file;
      }

      // Determine resource type based on media type
      const resourceType = this.getResourceType(options?.type);

      // Upload to Cloudinary
      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: options?.folder || this.config.folder || 'media',
            tags: options?.tags || [],
            resource_type: resourceType,
            transformation: options?.transformation,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!);
          }
        );

        uploadStream.end(buffer);
      });

      // Map Cloudinary response to our MediaUploadResult
      return this.mapCloudinaryResponse(result, options?.type);
    } catch (error) {
      console.error('[Cloudinary] Upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(publicId: string, type?: MediaType): Promise<boolean> {
    try {
      // destroy() defaults to resource_type 'image', so videos/raw files must say what they are
      const resourceTypes = type ? [this.getResourceType(type)] : (['image', 'video', 'raw'] as const);
      for (const resourceType of resourceTypes) {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
        if (result.result === 'ok') return true;
      }
      return false;
    } catch (error) {
      console.error('[Cloudinary] Delete error:', error);
      return false;
    }
  }

  /**
   * List every uploaded asset in the account (images, videos and raw files),
   * following next_cursor so accounts with more than one page are fully covered.
   */
  async listAll(): Promise<MediaUploadResult[]> {
    const all: MediaUploadResult[] = [];
    for (const resourceType of ['image', 'video', 'raw'] as const) {
      let nextCursor: string | undefined;
      do {
        const page: any = await cloudinary.api.resources({
          resource_type: resourceType,
          type: 'upload',
          max_results: 500,
          tags: true,
          next_cursor: nextCursor,
        });
        for (const r of page.resources || []) {
          all.push(this.mapCloudinaryResponse(r as UploadApiResponse, this.typeFromResource(r)));
        }
        nextCursor = page.next_cursor;
      } while (nextCursor);
    }
    return all;
  }

  private typeFromResource(r: { resource_type: string; format?: string; is_audio?: boolean }): MediaType {
    if (r.resource_type === 'image') return r.format === 'pdf' ? 'DOCUMENT' : 'IMAGE';
    if (r.resource_type === 'video') return r.is_audio || this.detectMediaType(r.format) === 'AUDIO' ? 'AUDIO' : 'VIDEO';
    return 'DOCUMENT';
  }

  getUrl(publicId: string, options?: TransformOptions): string {
    return cloudinary.url(publicId, {
      transformation: options ? this.buildTransformation(options) : undefined,
      secure: true,
    });
  }

  private getResourceType(type?: MediaType): 'image' | 'video' | 'raw' {
    switch (type) {
      case 'IMAGE':
        return 'image';
      case 'VIDEO':
        return 'video';
      case 'AUDIO':
        return 'video'; // Cloudinary treats audio as video
      case 'DOCUMENT':
        return 'raw';
      default:
        return 'image';
    }
  }

  private mapCloudinaryResponse(
    result: UploadApiResponse,
    type?: MediaType
  ): MediaUploadResult {
    // For raw files, format might be missing. Try to extract from public_id or url
    let detectedFormat = result.format;
    if (!detectedFormat && result.resource_type === 'raw') {
      const extension = result.public_id.split('.').pop();
      if (extension && extension !== result.public_id) {
        detectedFormat = extension;
      } else {
        const urlExtension = result.url.split('.').pop();
        if (urlExtension && urlExtension.length < 10) { // Safety check
          detectedFormat = urlExtension;
        }
      }
    }

    return {
      id: result.public_id,
      provider: 'CLOUDINARY',
      type: type || this.detectMediaType(detectedFormat),
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: detectedFormat,
      width: result.width,
      height: result.height,
      duration: result.duration,
      bytes: result.bytes,
      folder: result.folder || (result as any).asset_folder || undefined,
      tags: result.tags || [],
    };
  }

  private detectMediaType(format?: string): MediaType {
    if (!format) return 'IMAGE';
    
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioFormats = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
    const docFormats = ['pdf', 'doc', 'docx', 'txt', 'csv', 'zip', 'rar', 'json', 'md', 'js', 'ts', 'c', 'cpp', 'py', 'ino', 'h'];

    if (imageFormats.includes(format.toLowerCase())) return 'IMAGE';
    if (videoFormats.includes(format.toLowerCase())) return 'VIDEO';
    if (audioFormats.includes(format.toLowerCase())) return 'AUDIO';
    if (docFormats.includes(format.toLowerCase())) return 'DOCUMENT';

    return 'IMAGE';
  }

  private buildTransformation(options: TransformOptions) {
    const transformation: any = {};

    if (options.width) transformation.width = options.width;
    if (options.height) transformation.height = options.height;
    if (options.crop) transformation.crop = options.crop;
    if (options.quality) transformation.quality = options.quality;
    if (options.format) transformation.fetch_format = options.format;

    return transformation;
  }

  // Test connection to Cloudinary
  static async testConnection(config: CloudinaryConfig): Promise<boolean> {
    try {
      cloudinary.config({
        cloud_name: config.cloudName,
        api_key: config.apiKey,
        api_secret: config.apiSecret,
      });

      // Try to get account details
      await cloudinary.api.ping();
      return true;
    } catch (error) {
      console.error('[Cloudinary] Connection test failed:', error);
      return false;
    }
  }
}
