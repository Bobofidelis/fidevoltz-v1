// Media Provider Types and Interfaces

export type MediaProvider = 'CLOUDINARY' | 'AWS_S3' | 'LOCAL';
export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export interface MediaUploadResult {
  id: string;
  provider: MediaProvider;
  type: MediaType;
  publicId: string;
  url: string;
  secureUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes?: number;
  folder?: string;
  tags?: string[];
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export type ProviderConfig = CloudinaryConfig | S3Config;

export interface MediaProviderAdapter {
  upload(file: File | Buffer, options?: UploadOptions): Promise<MediaUploadResult>;
  delete(publicId: string): Promise<boolean>;
  getUrl(publicId: string, options?: TransformOptions): string;
}

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  type?: MediaType;
  transformation?: TransformOptions;
}

export interface TransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop';
  quality?: number | 'auto';
  format?: string;
}

export interface MediaFilter {
  type?: MediaType;
  provider?: MediaProvider;
  folder?: string;
  tags?: string[];
  createdById?: string;
  limit?: number;
  offset?: number;
}
