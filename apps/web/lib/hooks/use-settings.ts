import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

// Get user settings
export function useUserSettings() {
  const { data: session } = useSession();
  
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      const response = await fetch('/api/user/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session?.user, // Only run if user is logged in
    retry: false,
  });
}

// Update user settings
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update settings');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success(data.message || 'Settings updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { update } = useSession();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      return result;
    },
    onSuccess: async (data) => {
      // Update NextAuth session with new profile data
      await update({
        user: {
          name: data.data.name,
        },
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Also invalidate profile page query
      toast.success(data.message || 'Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Change password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch('/api/user/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password changed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Get site settings (admin only)
export function useSiteSettings() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Admin access required');
        }
        throw new Error('Failed to fetch site settings');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: isAdmin, // Only run query if user is admin
    retry: false,
  });
}

// Update site settings (admin only)
export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: any[]) => {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update settings');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success(data.message || 'Settings updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Initialize default settings (admin only)
export function useInitializeSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize settings');
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success(data.message || 'Settings initialized successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
