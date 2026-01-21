import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface ProfileData {
  name?: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Fetch current user profile
export function useProfile() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const result = await response.json();
      return result.data;
    },
    enabled: !!session?.user,
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { update } = useSession();

  return useMutation({
    mutationFn: async (data: ProfileData) => {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      // Update the session with new profile data
      await update({
        user: {
          name: data.data.name,
        },
      });
      
      // Invalidate profile query to update profile page
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Update avatar mutation
export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const { update } = useSession();

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await fetch('/api/user/avatar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update avatar');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      // Update the session with new avatar
      await update({
        user: {
          image: data.data.avatar,
        },
      });
      
      // Invalidate profile query to update profile page
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast.success('Avatar updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: PasswordData) => {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
