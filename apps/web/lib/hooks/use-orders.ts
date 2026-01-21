import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { OrderStatus } from '@prisma/client';

// Fetch orders with filters
export function useOrders(filters?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/orders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session,
  });
}

// Fetch single order
export function useOrder(orderId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && !!orderId,
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: string; status: OrderStatus; note?: string }) => {
      console.log('[useUpdateOrderStatus] Updating status:', { orderId, status, note });
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });

      console.log('[useUpdateOrderStatus] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[useUpdateOrderStatus] Error response:', error);
        throw new Error(error.error || 'Failed to update order status');
      }

      const result = await response.json();
      console.log('[useUpdateOrderStatus] Success:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[useUpdateOrderStatus] onSuccess, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Order status updated successfully!');
    },
    onError: (error: Error) => {
      console.error('[useUpdateOrderStatus] onError:', error);
      toast.error(error.message);
    },
  });
}

// Fetch order messages
export function useOrderMessages(orderId: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['orderMessages', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && !!orderId,
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  });
}

// Send order message
export function useSendOrderMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, message }: { orderId: string; message: string }) => {
      console.log('[useSendOrderMessage] Sending message:', { orderId, message });
      
      const response = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      console.log('[useSendOrderMessage] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('[useSendOrderMessage] Error response:', error);
        throw new Error(error.error || 'Failed to send message');
      }

      const result = await response.json();
      console.log('[useSendOrderMessage] Success:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('[useSendOrderMessage] onSuccess, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['orderMessages', variables.orderId] });
      toast.success('Message sent!');
    },
    onError: (error: Error) => {
      console.error('[useSendOrderMessage] onError:', error);
      toast.error(error.message);
    },
  });
}

// Update tracking information
export function useUpdateTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      trackingNumber,
      carrier,
      estimatedDelivery,
    }: {
      orderId: string;
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: string;
    }) => {
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, carrier, estimatedDelivery }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update tracking');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      toast.success('Tracking information updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
