import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@fidevoltz/types';

export function usePublicSettings(category?: string) {
  return useQuery({
    queryKey: ['public-settings', category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      
      const response = await fetch(`/api/settings?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch public settings');
      }
      
      const result: ApiResponse = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch public settings');
      }
      
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
