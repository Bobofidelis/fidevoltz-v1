'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploadProps {
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'ALL';
  multiple?: boolean;
  onSuccess?: (media: any[]) => void;
  folder?: string;
  tags?: string[];
}

export function MediaUpload({
  mediaType = 'IMAGE',
  multiple = false,
  onSuccess,
  folder,
  tags = [],
}: MediaUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const acceptedTypes = {
    IMAGE: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    VIDEO: { 'video/*': ['.mp4', '.avi', '.mov', '.wmv'] },
    AUDIO: { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] },
    DOCUMENT: { 
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt', '.md', '.csv'],
      'application/zip': ['.zip', '.rar'],
      'text/x-c': ['.c', '.cpp', '.h', '.ino'],
      'text/x-python': ['.py'],
      'text/javascript': ['.js', '.ts'],
      'application/json': ['.json']
    },
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => (multiple ? [...prev, ...acceptedFiles] : acceptedFiles));
    setError(null);
  }, [multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mediaType === 'ALL' 
      ? { ...acceptedTypes.IMAGE, ...acceptedTypes.VIDEO, ...acceptedTypes.AUDIO, ...acceptedTypes.DOCUMENT }
      : acceptedTypes[mediaType as keyof typeof acceptedTypes],
    multiple,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      if (folder) formData.append('folder', folder);
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
      if (mediaType !== 'ALL') {
        formData.append('type', mediaType);
      }

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedMedia(data.media || []);
      toast.success(data.message || 'Upload successful!');
      
      if (onSuccess) {
        onSuccess(data.media || []);
      }

      // Clear files after successful upload
      setFiles([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">
              Drag & drop {multiple ? 'files' : 'a file'} here
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {mediaType === 'IMAGE' && 'Supported: PNG, JPG, GIF, WebP'}
              {mediaType === 'VIDEO' && 'Supported: MP4, AVI, MOV, WMV'}
              {mediaType === 'AUDIO' && 'Supported: MP3, WAV, OGG, M4A'}
              {mediaType === 'DOCUMENT' && 'Supported: PDF, DOC, TXT, ZIP'}
              {mediaType === 'ALL' && 'Supported: Images, Videos, Audio, Documents'}
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {uploadedMedia.length > 0 && !uploading && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            Successfully uploaded {uploadedMedia.length} file(s)!
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <Button onClick={handleUpload} className="w-full" size="lg">
          <Upload className="w-4 h-4 mr-2" />
          Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
        </Button>
      )}
    </div>
  );
}
