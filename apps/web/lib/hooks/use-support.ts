import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Get user's tickets
export function useUserTickets() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-tickets'],
    queryFn: async () => {
      const response = await fetch('/api/support/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

// Create new ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      subject: string;
      description: string;
      priority?: string;
    }) => {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Reply to ticket
export function useReplyToTicket() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      // Use the standard support route - it already handles both admin and user replies
      const endpoint = `/api/support/tickets/${ticketId}/reply`;

      console.log('[SUPPORT] Sending reply to:', endpoint);
      console.log('[SUPPORT] User role:', session?.user?.role);
      console.log('[SUPPORT] Ticket ID:', ticketId);
      console.log('[SUPPORT] Message:', message.substring(0, 50));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      console.log('[SUPPORT] Response status:', response.status);
      console.log('[SUPPORT] Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('[SUPPORT] Response data:', result);

      if (!response.ok) {
        console.error('[SUPPORT] Error response:', result);
        throw new Error(result.error || 'Failed to add reply');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast.success('Reply added successfully');
    },
    onError: (error: Error) => {
      console.error('Reply error:', error);
      toast.error(error.message || 'Failed to add reply');
    },
  });
}

// Admin: Get all tickets with filters
export function useAdminTickets(filters?: {
  status?: string;
  priority?: string;
  assignedTo?: string;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['admin-tickets', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);

      const response = await fetch(`/api/admin/support/tickets?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && session.user.role === 'ADMIN',
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

// Admin: Update ticket
export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      status,
      priority,
      assignedTo,
    }: {
      ticketId: string;
      status?: string;
      priority?: string;
      assignedTo?: string | null;
    }) => {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority, assignedTo }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      toast.success('Ticket updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Admin: Delete ticket
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete ticket');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      toast.success('Ticket deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
