import { useQuery } from '@tanstack/react-query';

// Get public site settings
export function usePublicSiteSettings(category?: string) {
  return useQuery({
    queryKey: ['public-site-settings', category],
    queryFn: async () => {
      const url = category ? `/api/settings?category=${category}` : '/api/settings';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch settings');
      const result = await response.json();
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
