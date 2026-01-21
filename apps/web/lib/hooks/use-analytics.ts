import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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

// Track page view
export async function trackPageView(page: string, path: string, sessionId: string, userId?: string) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        path,
        referrer: document.referrer,
        sessionId,
        userId,
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

// Track custom event
export async function trackEvent(action: string, resource?: string, resourceId?: string, metadata?: any, userId?: string) {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action,
        resource,
        resourceId,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Export analytics data
export async function exportAnalytics(type: 'csv' | 'pdf' | 'excel', days: number = 30) {
  try {
    const response = await fetch(`/api/admin/analytics/export?type=${type}&days=${days}`);
    if (!response.ok) throw new Error('Failed to export analytics');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.${type}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success('Analytics exported successfully!');
  } catch (error) {
    toast.error('Failed to export analytics');
    console.error('Export error:', error);
  }
}
