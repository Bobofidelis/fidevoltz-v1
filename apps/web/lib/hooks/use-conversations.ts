import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export interface Conversation {
  participant: { id: string; name: string | null; email: string; role: string; avatar: string | null };
  lastMessage: { message: string; createdAt: string; isSentByMe: boolean } | null;
  unreadCount: number;
  totalMessages: number;
}

// Inbox: everyone the signed-in user has exchanged messages with, newest first, with unread counts
export function useConversations(enabled = true) {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<Conversation[]> => {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const result = await response.json();
      return result.data || [];
    },
    enabled,
    refetchInterval: 15000,
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
