import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Get comments for a post (public)
export function usePostComments(slug: string) {
  return useQuery({
    queryKey: ['post-comments', slug],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${slug}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const result = await response.json();
      return result.data;
    },
    enabled: !!slug,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

// Create comment on a post
export function useCreatePostComment(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const response = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to post comment');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', slug] });
      toast.success(data.message || 'Comment posted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
