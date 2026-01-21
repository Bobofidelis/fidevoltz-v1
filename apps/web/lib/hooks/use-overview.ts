import { useQuery } from '@tanstack/react-query';

// Get overview stats
export function useOverviewStats() {
  return useQuery({
    queryKey: ['overview-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/overview/stats');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch overview stats');
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
  });
}

// Get activity feed
export function useActivityFeed(limit = 20) {
  return useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/overview/activity?limit=${limit}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch activity feed');
      }
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false,
  });
}

// Get notifications
export function useNotifications(limit = 10) {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/overview/notifications?limit=${limit}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch notifications');
      }
      const result = await response.json();
      return result.data;
    },
    retry: false,
  });
}

// Get analytics overview with date range
export function useAnalyticsOverview(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  return useQuery({
    queryKey: ['analytics-overview', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/overview?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch analytics overview');
      }
      const result = await response.json();
      return result.data;
    },
    retry: false,
  });
}

// Get profit analytics
export function useProfitAnalytics(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  return useQuery({
    queryKey: ['profit-analytics', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/profit?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch profit analytics');
      }
      const result = await response.json();
      return result.data;
    },
    retry: false,
  });
}

// Get activity logs
export function useActivityLogs(page = 1, limit = 50, filters?: { search?: string; resource?: string; userId?: string }) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (filters?.search) params.append('search', filters.search);
  if (filters?.resource) params.append('resource', filters.resource);
  if (filters?.userId) params.append('userId', filters.userId);

  return useQuery({
    queryKey: ['activity-logs', page, limit, filters],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/activity-log?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch activity logs');
      }
      const result = await response.json();
      return result.data;
    },
    retry: false,
  });
}

// Get sales analytics
export function useSalesAnalytics(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  return useQuery({
    queryKey: ['sales-analytics', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/sales?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch sales analytics');
      }
      const result = await response.json();
      return result.data;
    },
    retry: false,
  });
}

// Get user analytics
export function useUserAnalytics(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString());
  if (endDate) params.append('endDate', endDate.toISOString());

  return useQuery({
    queryKey: ['user-analytics', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/users?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch user analytics');
      }
      const result = await response.json();
      return result.data;
    },
    retry: false,
  });
}
