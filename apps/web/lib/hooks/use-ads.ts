import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Get all advertisements
export function useAds(filters?: { status?: string; type?: string; page?: string }) {
  const queryString = new URLSearchParams(filters as any).toString();
  
  return useQuery({
    queryKey: ['ads', filters],
    queryFn: async () => {
      const response = await fetch(`/api/admin/ads?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch ads');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Get single advertisement
export function useAd(id: string) {
  return useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/ads/${id}`);
      if (!response.ok) throw new Error('Failed to fetch ad');
      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
  });
}

// Create advertisement
export function useCreateAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create ad');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success(data.message || 'Ad created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update advertisement
export function useUpdateAd(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update ad');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', id] });
      toast.success(data.message || 'Ad updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete advertisement
export function useDeleteAd() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete ad');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success(data.message || 'Ad deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Add placement to ad
export function useAddPlacement(adId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { page: string; zone: string; position?: number }) => {
      const response = await fetch(`/api/admin/ads/${adId}/placements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add placement');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
      toast.success(data.message || 'Placement added successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Get ad analytics
export function useAdAnalytics(period?: string) {
  return useQuery({
    queryKey: ['ad-analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/admin/ads/analytics?period=${period || '30'}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Get SEO metrics
export function useSEOMetrics() {
  return useQuery({
    queryKey: ['seo-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/seo');
      if (!response.ok) throw new Error('Failed to fetch SEO metrics');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Get ads for a page (public)
export function usePageAds(page: string) {
  return useQuery({
    queryKey: ['page-ads', page],
    queryFn: async () => {
      const response = await fetch(`/api/ads?page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch ads');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!page,
    staleTime: 60000, // Cache for 1 minute
  });
}

// Track ad click
export async function trackAdClick(adId: string) {
  try {
    await fetch(`/api/ads/click/${adId}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to track ad click:', error);
  }
}
