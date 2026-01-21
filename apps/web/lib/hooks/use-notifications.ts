import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { NotificationType } from '@prisma/client';

// Fetch notifications with filters
export function useNotifications(filters?: {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  priority?: string;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.type) params.append('type', filters.type);
      if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
      if (filters?.priority) params.append('priority', filters.priority);

      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session,
    refetchInterval: 30000, // Poll every 30 seconds for new notifications
  });
}

// Fetch single notification
export function useNotification(id: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['notification', id],
    queryFn: async () => {
      const response = await fetch(`/api/notifications/${id}`);
      if (!response.ok) throw new Error('Failed to fetch notification');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && !!id,
  });
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as read');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Mark all as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark all as read');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(data.message || 'All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete notification');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Broadcast notification (Admin only)
export function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: NotificationType;
      title: string;
      message: string;
      actionUrl?: string;
      actionLabel?: string;
      priority?: string;
      targetRole?: 'ALL' | 'USER' | 'ADMIN' | 'EDITOR';
    }) => {
      const response = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to broadcast notification');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(data.message || 'Broadcast sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
