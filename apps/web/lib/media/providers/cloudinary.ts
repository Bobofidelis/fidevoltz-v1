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

  async delete(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('[Cloudinary] Delete error:', error);
      return false;
    }
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
      folder: result.folder,
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
