'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Video, Music, ExternalLink, Trash2, Check, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-purple-100 text-purple-700';
      case 'AUDIO': return 'bg-green-100 text-green-700';
      case 'DOCUMENT': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
          <ImageIcon className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-slate-600 font-medium">Failed to load media</p>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
        <Button onClick={loadMedia} variant="outline" className="mt-4 gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          {getMediaIcon(mediaType || 'IMAGE')}
        </div>
        <p className="font-medium text-slate-700">No {mediaType?.toLowerCase() || 'media'} found</p>
        <p className="text-sm text-slate-400 mt-1">Upload files using the "Upload New" tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{media.length} file{media.length !== 1 ? 's' : ''}</p>
        <Button type="button" variant="ghost" size="sm" onClick={loadMedia} className="gap-1 text-xs h-7">
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {media.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const url = item.secureUrl || item.url;

          return (
            <div
              key={item.id}
              className={`
                group relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all bg-white
                ${selectable ? 'hover:border-blue-400 hover:shadow-md' : ''}
                ${isSelected ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-slate-200'}
              `}
              onClick={() => onMediaClick && onMediaClick(item)}
            >
              <div className="aspect-square relative bg-slate-100 overflow-hidden">
                {item.type === 'IMAGE' ? (
                  <img
                    src={url}
                    alt={item.publicId || 'Image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : item.type === 'VIDEO' ? (
                  <div className="w-full h-full relative">
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                      onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const v = e.currentTarget as HTMLVideoElement;
                        v.pause();
                        v.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 p-4">
                    {getMediaIcon(item.type)}
                    <span className="text-xs text-center font-medium truncate w-full text-center">
                      {item.format?.toUpperCase() || 'FILE'}
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                {/* Type Badge */}
                {!selectable && (
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end gap-1.5 p-2">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center transition-colors shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(url, '_blank');
                    }}
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  {onDelete && (
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Media Info */}
              <div className="p-2 border-t border-slate-100">
                <p className="text-xs font-medium truncate text-slate-700" title={item.publicId}>
                  {item.publicId?.split('/').pop() || 'Untitled'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {item.format?.toUpperCase() || 'FILE'} • {(item.bytes / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
