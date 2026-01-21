import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { ApiResponse } from '@fidevoltz/types';

interface UseApiQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  queryKey: string[];
  requireAuth?: boolean; // Optional: set to false for public endpoints
}

export function useApiQuery<T>({ endpoint, queryKey, requireAuth = false, ...options }: UseApiQueryOptions<T>) {
  const { data: session } = useSession();

  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // NextAuth handles session automatically, no need to manually add token
      const response = await fetch(endpoint, {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error: ApiResponse = await response.json().catch(() => ({
          success: false,
          error: 'Request failed',
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed');
      }

      return result.data as T;
    },
    // Only require session if requireAuth is true
    enabled: options.enabled !== false && (requireAuth ? !!session : true),
    ...options,
  });
}
