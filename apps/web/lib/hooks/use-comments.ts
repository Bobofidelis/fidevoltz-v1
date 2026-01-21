import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Get all comments (admin)
export function useAdminComments(filters?: {
  status?: string;
  postId?: string;
  userId?: string;
  flagged?: boolean;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['admin-comments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.postId) params.append('postId', filters.postId);
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.flagged !== undefined) params.append('flagged', filters.flagged.toString());

      const response = await fetch(`/api/admin/comments?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && session.user.role === 'ADMIN',
    refetchInterval: 5000,
  });
}

// Update comment
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      status,
      isFlagged,
      flagReason,
    }: {
      commentId: string;
      status?: string;
      isFlagged?: boolean;
      flagReason?: string;
    }) => {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isFlagged, flagReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Reply to comment
export function useReplyToComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, reply }: { commentId: string; reply: string }) => {
      const response = await fetch(`/api/admin/comments/${commentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add reply');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Reply added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete comment
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Comment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Warn user
export function useWarnUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/warn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to warn user');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('User warned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Ban/Unban user
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      ban,
      reason,
    }: {
      userId: string;
      ban: boolean;
      reason?: string;
    }) => {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ban status');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success(variables.ban ? 'User banned successfully' : 'User unbanned successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
