'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Video, Music, ExternalLink, Trash2, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface MediaGridProps {
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  selectedIds?: string[];
  onMediaClick?: (media: any) => void;
  selectable?: boolean;
  onDelete?: (mediaId: string) => void;
}

export function MediaGrid({
  mediaType,
  selectedIds = [],
  onMediaClick,
  selectable = false,
  onDelete,
}: MediaGridProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, [mediaType]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (mediaType) params.append('type', mediaType);

      const response = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load media');
      }

      setMedia(data.media || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load media';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete media');
      }

      toast.success('Media deleted successfully');
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
      
      if (onDelete) {
        onDelete(mediaId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete media';
      toast.error(errorMessage);
    }
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-8 h-8" />;
      case 'AUDIO':
        return <Music className="w-8 h-8" />;
      case 'DOCUMENT':
        return <FileText className="w-8 h-8" />;
      default:
        return <ImageIcon className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadMedia} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
          {getMediaIcon(mediaType || 'IMAGE')}
        </div>
        <p className="text-muted-foreground">No media found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload some media to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map((item) => {
        const isSelected = selectedIds.includes(item.id);

        return (
          <Card
            key={item.id}
            className={`
              group relative overflow-hidden cursor-pointer transition-all
              ${selectable ? 'hover:ring-2 hover:ring-primary' : ''}
              ${isSelected ? 'ring-2 ring-primary' : ''}
            `}
            onClick={() => onMediaClick && onMediaClick(item)}
          >
            <div className="aspect-square relative bg-muted">
              {item.type === 'IMAGE' ? (
                <img
                  src={item.secureUrl || item.url}
                  alt={item.publicId}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {getMediaIcon(item.type)}
                </div>
              )}

              {/* Selection Indicator */}
              {selectable && isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.secureUrl || item.url, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Media Info */}
            <div className="p-2">
              <p className="text-xs font-medium truncate">{item.publicId}</p>
              <p className="text-xs text-muted-foreground truncate">
                {item.format ? item.format.toUpperCase() : 'FILE'} • {(item.bytes / 1024).toFixed(0)} KB
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
