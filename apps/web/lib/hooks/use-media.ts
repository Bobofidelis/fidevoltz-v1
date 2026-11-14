'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Media {
  id: string;
  provider: 'CLOUDINARY' | 'AWS_S3' | 'LOCAL';
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  publicId: string;
  url: string;
  secureUrl: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  bytes: number | null;
  folder: string | null;
  tags: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
}

// Upload media
export function useMediaUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      folder,
      tags,
    }: {
      files: File[];
      folder?: string;
      tags?: string[];
    }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      if (folder) formData.append('folder', folder);
      if (tags && tags.length > 0) formData.append('tags', tags.join(','));

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = 'Failed to upload media';
        try {
          const error = await res.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          // Response is not JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success(data.message || 'Media uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

