'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

interface MediaListParams {
  type?: string;
  folder?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Fetch media list
export function useMedia(params: MediaListParams = {}) {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.set('type', params.type);
  if (params.folder) queryParams.set('folder', params.folder);
  if (params.search) queryParams.set('search', params.search);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

  return useQuery({
    queryKey: ['media', params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/media?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch media');
      const data = await res.json();
      return data.data;
    },
  });
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

// Update media metadata
export function useMediaUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { originalName?: string; folder?: string | null; tags?: string[] };
    }) => {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update media');
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success(data.message || 'Media updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete media
export function useMediaDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete media');
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success(data.message || 'Media deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Bulk operations
export function useMediaBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      ids,
      data,
    }: {
      action: 'delete' | 'updateFolder' | 'addTags';
      ids: string[];
      data?: any;
    }) => {
      const res = await fetch('/api/admin/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids, data }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to perform bulk operation');
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success(data.message || 'Bulk operation completed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Get categories
export function useMediaCategories() {
  return useQuery({
    queryKey: ['media-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/media/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      return data.data;
    },
  });
}
