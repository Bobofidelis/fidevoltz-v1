import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Role } from '@prisma/client';

// Fetch all users with filters
export function useUsers(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | 'ALL';
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role && filters.role !== 'ALL') params.append('role', filters.role);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && session.user.role === 'ADMIN',
  });
}

// Fetch single user details
export function useUserDetails(userId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && session.user.role === 'ADMIN' && !!userId,
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user', variables.userId] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deactivated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Send direct message to user
export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, subject, message }: { userId: string; subject?: string; message: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-messages', variables.userId] });
      toast.success('Message sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Fetch user messages
export function useUserMessages(userId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-messages', userId],
    queryFn: async () => {
      // If admin viewing another user's messages
      if (session?.user.role === 'ADMIN' && userId !== session.user.id) {
        const response = await fetch(`/api/admin/users/${userId}/message`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const result = await response.json();
        return result.data;
      }
      
      // Regular user fetching their own messages
      const response = await fetch('/api/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && !!userId,
    refetchInterval: 3000, // Refetch every 3 seconds
  });
}

// Fetch user activity
export function useUserActivity(userId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}/activity`);
      if (!response.ok) throw new Error('Failed to fetch activity');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && session.user.role === 'ADMIN' && !!userId,
  });
}
