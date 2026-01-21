'use client';

import { useState, useCallback } from 'react';
import { useMediaUpload } from '@/lib/hooks/use-media';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileIcon, Image, Video, Music, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaUploaderProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function MediaUploader({ onClose, onSuccess }: MediaUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMediaUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    await uploadMutation.mutateAsync({
      files,
      folder: folder || undefined,
      tags,
    });

    onSuccess?.();
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />;
    return <FileText className="h-8 w-8 text-orange-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Media Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Drop files here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Files
                </label>
              </Button>
              <p className="text-xs text-muted-foreground">
                Supported: Images (10MB), Videos (100MB), Audio (50MB), Documents (20MB)
              </p>
            </div>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Label>Selected Files ({files.length})</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folder */}
          <div className="space-y-2">
            <Label htmlFor="folder">Folder (Optional)</Label>
            <Input
              id="folder"
              placeholder="e.g., product-images, blog-photos"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <Label>Uploading...</Label>
              <Progress value={50} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : `Upload ${files.length} File(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
