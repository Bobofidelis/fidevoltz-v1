import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

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
