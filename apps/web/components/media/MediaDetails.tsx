'use client';

import { useState } from 'react';
import { type Media, useMediaUpdate } from '@/lib/hooks/use-media';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  X,
  Download,
  Trash2,
  Copy,
  Check,
  Image,
  Video,
  Music,
  FileText,
  Calendar,
  User,
  HardDrive,
  Tag,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaDetailsProps {
  media: Media;
  onClose: () => void;
  onDelete: () => void;
}

export function MediaDetails({ media, onClose, onDelete }: MediaDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    folder: media.folder || '',
    tags: media.tags.join(', '),
  });
  const [copied, setCopied] = useState(false);

  const updateMutation = useMediaUpdate();

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: media.id,
      data: {
        folder: editData.folder || null,
        tags: editData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      },
    });
    setIsEditing(false);
  };

  const copyUrl = () => {
    const fullUrl = `${window.location.origin}${media.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getMediaIcon = () => {
    switch (media.type) {
      case 'IMAGE':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'VIDEO':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'AUDIO':
        return <Music className="h-5 w-5 text-green-500" />;
      case 'DOCUMENT':
        return <FileText className="h-5 w-5 text-orange-500" />;
    }
  };

  return (
    <Card className="sticky top-6">
      <div className="p-4 flex items-center justify-between border-b">
        <h3 className="font-semibold">Media Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {media.type === 'IMAGE' ? (
            <img
              src={media.url}
              alt={media.publicId}
              className="w-full h-full object-contain"
            />
          ) : media.type === 'VIDEO' ? (
            <video src={media.url} controls className="w-full h-full" />
          ) : media.type === 'AUDIO' ? (
            <div className="w-full p-4">
              <audio src={media.url} controls className="w-full" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {getMediaIcon()}
              <p className="text-sm text-muted-foreground">Document Preview</p>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Public ID (Read-only)</Label>
              <Input
                id="name"
                value={media.publicId}
                readOnly
                disabled
              />
            </div>
            <div>
              <Label htmlFor="folder">Folder</Label>
              <Input
                id="folder"
                value={editData.folder}
                onChange={(e) =>
                  setEditData({ ...editData, folder: e.target.value })
                }
                placeholder="e.g., product-images"
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={editData.tags}
                onChange={(e) =>
                  setEditData({ ...editData, tags: e.target.value })
                }
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    folder: media.folder || '',
                    tags: media.tags.join(', '),
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* File Info */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Public ID</p>
                <p className="font-medium text-sm break-all">{media.publicId}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {getMediaIcon()}
                    <span>Type</span>
                  </div>
                  <Badge variant="secondary">{media.type}</Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <HardDrive className="h-4 w-4" />
                    <span>Size</span>
                  </div>
                  <p className="font-medium">{media.bytes ? formatFileSize(media.bytes) : 'N/A'}</p>
                </div>
              </div>

              {(media.width || media.height) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dimensions</p>
                  <p className="font-medium text-sm">
                    {media.width} × {media.height}
                  </p>
                </div>
              )}

              {media.folder && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <FolderOpen className="h-4 w-4" />
                    <span>Folder</span>
                  </div>
                  <Badge variant="outline">{media.folder}</Badge>
                </div>
              )}

              {media.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {media.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span>Uploaded By</span>
                </div>
                <p className="font-medium text-sm">
                  {media.creator.name || media.creator.email}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Uploaded</span>
                </div>
                <p className="font-medium text-sm">
                  {new Date(media.createdAt).toLocaleString()}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">File URL</p>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}${media.url}`}
                    readOnly
                    className="text-xs"
                  />
                  <Button variant="outline" size="icon" onClick={copyUrl}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(true)}
              >
                Edit Details
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(media.url, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="destructive" className="w-full" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
