import { useQuery } from '@tanstack/react-query';

// Get analytics overview
export function useAnalyticsOverview(days: number = 7) {
  return useQuery({
    queryKey: ['analytics-overview', days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/overview?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Get sales analytics
export function useSalesAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['sales-analytics', days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/sales?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch sales analytics');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000,
  });
}

// Get traffic analytics
export function useTrafficAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['traffic-analytics', days],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/traffic?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch traffic analytics');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 60000,
  });
}

