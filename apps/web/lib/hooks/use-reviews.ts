import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Get reviews for a product
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      return result.data;
    },
    enabled: !!productId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

// Submit a review
export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      rating: number;
      title?: string;
      comment: string;
    }) => {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      toast.success('Review submitted successfully! It will be visible after admin approval.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Admin: Get all reviews with filters
export function useAdminReviews(filters?: {
  status?: string;
  productId?: string;
  page?: number;
  limit?: number;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['admin-reviews', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session && session.user.role === 'ADMIN',
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

// Admin: Update review status
export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, status }: { reviewId: string; status: string }) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      toast.success('Review status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Admin: Reply to review
export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reply`, {
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
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      toast.success('Reply added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Admin: Delete review
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete review');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      toast.success('Review deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
