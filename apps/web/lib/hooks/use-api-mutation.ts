import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse } from '@fidevoltz/types';

interface UseApiMutationOptions<TData, TVariables> 
  extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  endpoint: string;
  method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  invalidateQueries?: string[][];
}

export function useApiMutation<TData = any, TVariables = any>({
  endpoint,
  method = 'POST',
  invalidateQueries = [],
  ...options
}: UseApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const config: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };

      if (method !== 'DELETE' && variables) {
        config.body = JSON.stringify(variables);
      }

      const response = await fetch(endpoint, config);

      if (!response.ok) {
        const error: ApiResponse = await response.json().catch(() => ({
          success: false,
          error: 'Request failed',
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result: ApiResponse<TData> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed');
      }

      return result.data as TData;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries after successful mutation
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Call user-provided onSuccess if exists
      (options as any).onSuccess?.(data, variables, context);
    },
    ...options,
  });
}
