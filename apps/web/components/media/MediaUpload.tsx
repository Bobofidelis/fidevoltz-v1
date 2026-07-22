'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, CheckCircle, AlertCircle, Film, Music, FileText, Image as ImageIcon } from 'lucide-react';
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
    IMAGE: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'] },
    VIDEO: { 'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.m4v', '.3gp'] },
    AUDIO: { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'] },
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
    setProgress(10);
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

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 85));
      }, 400);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

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
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getTypeInfo = () => {
    switch (mediaType) {
      case 'VIDEO': return { icon: Film, label: 'video', accept: 'MP4, WebM, MOV, AVI, MKV' };
      case 'AUDIO': return { icon: Music, label: 'audio', accept: 'MP3, WAV, OGG, M4A, FLAC' };
      case 'DOCUMENT': return { icon: FileText, label: 'document', accept: 'PDF, DOC, TXT, ZIP, Code files' };
      case 'ALL': return { icon: Upload, label: 'file', accept: 'Images, Videos, Audio, Documents' };
      default: return { icon: ImageIcon, label: 'image', accept: 'PNG, JPG, GIF, WebP, SVG' };
    }
  };

  const typeInfo = getTypeInfo();
  const TypeIcon = typeInfo.icon;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 scale-[1.01]' 
            : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isDragActive ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 shadow-sm border border-slate-200'
          }`}>
            <TypeIcon className="w-7 h-7" />
          </div>
          
          {isDragActive ? (
            <div>
              <p className="text-lg font-semibold text-blue-600">Drop {typeInfo.label}(s) here</p>
              <p className="text-sm text-blue-400 mt-1">Release to add to queue</p>
            </div>
          ) : (
            <div>
              <p className="text-base font-semibold text-slate-700">
                Drag & drop {multiple ? typeInfo.label + 's' : 'a ' + typeInfo.label} here
              </p>
              <p className="text-sm text-slate-400 mt-1">or click to browse</p>
              <p className="text-xs text-slate-400 mt-2 font-mono bg-white px-3 py-1 rounded-full border border-slate-100">
                {typeInfo.accept}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">
              Ready to upload ({files.length} file{files.length !== 1 ? 's' : ''})
            </h4>
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              onClick={() => setFiles([])}
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    type="button"
                    className="ml-2 w-6 h-6 rounded-md hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-400 transition-colors"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between text-sm font-medium text-blue-800">
            <span>Uploading to cloud...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {uploadedMedia.length > 0 && !uploading && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Successfully uploaded {uploadedMedia.length} file{uploadedMedia.length !== 1 ? 's' : ''}! Switch to "Select Existing" to use them.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <Button
          type="button"
          onClick={handleUpload}
          className="w-full h-12 text-base font-semibold gap-2 shadow-md hover:shadow-lg transition-shadow"
          size="lg"
        >
          <Upload className="w-5 h-5" />
          Upload {files.length} {files.length === 1 ? typeInfo.label : typeInfo.label + 's'}
        </Button>
      )}
    </div>
  );
}
