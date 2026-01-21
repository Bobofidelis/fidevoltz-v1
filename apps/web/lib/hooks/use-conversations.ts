import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Get all conversations
export function useConversations() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

// Get messages for a specific conversation
export function useConversation(partnerId: string | null) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['conversation', partnerId],
    queryFn: async () => {
      const response = await fetch(`/api/messages?partnerId=${partnerId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && !!partnerId,
    refetchInterval: 3000, // Refetch every 3 seconds for active conversation
  });
}

// Send message mutation
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      recipientId?: string;
      subject?: string;
      message: string;
    }) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
      queryClient.invalidateQueries({ queryKey: ['user-messages'] });
      toast.success('Message sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Mark message as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
}

// Search messages
export function useSearchMessages(query: string, partnerId?: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['search-messages', query, partnerId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (partnerId) params.append('partnerId', partnerId);

      const response = await fetch(`/api/messages/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search messages');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && query.length > 0,
  });
}

// Get WhatsApp settings (admin only)
export function useWhatsAppSettings() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/whatsapp-settings');
      if (!response.ok) throw new Error('Failed to fetch WhatsApp settings');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session, // Allow all authenticated users to fetch
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

// Update WhatsApp settings (admin only)
export function useUpdateWhatsAppSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { phoneNumber: string; enabled: boolean }) => {
      const response = await fetch('/api/admin/whatsapp-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update WhatsApp settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-settings'] });
      toast.success('WhatsApp settings updated');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
