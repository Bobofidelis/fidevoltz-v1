import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Get all contact submissions
export function useContactSubmissions(filters?: {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryString = new URLSearchParams(filters as any).toString();
  
  return useQuery({
    queryKey: ['contact-submissions', filters],
    queryFn: async () => {
      const response = await fetch(`/api/admin/contact-submissions?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const result = await response.json();
      return result.data;
    },
  });
}

// Get single contact submission
export function useContactSubmission(id: string) {
  return useQuery({
    queryKey: ['contact-submission', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/contact-submissions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch submission');
      const result = await response.json();
      return result.data;
    },
    enabled: !!id,
  });
}

// Update contact submission
export function useUpdateContactSubmission(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { status?: string; notes?: string; assignedToId?: string }) => {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update submission');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['contact-submission', id] });
      toast.success(data.message || 'Submission updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Reply to contact submission
export function useReplyToSubmission(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reply: string) => {
      const response = await fetch(`/api/admin/contact-submissions/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reply');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['contact-submission', id] });
      toast.success(data.message || 'Reply sent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Delete contact submission
export function useDeleteContactSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete submission');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      toast.success(data.message || 'Submission deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
