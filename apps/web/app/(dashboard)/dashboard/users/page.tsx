"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { UsersTable } from '@/components/admin/users-table';
import { UserDetailsModal } from '@/components/admin/user-details-modal';
import { SendMessageModal } from '@/components/admin/send-message-modal';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, Shield } from 'lucide-react';
import { useUsers, useUserDetails } from '@/lib/hooks/use-admin-users';
import { redirect } from 'next/navigation';

export default function UsersManagementPage() {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageUserId, setMessageUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const { data } = useUsers({});
  const { data: editUser } = useUserDetails(editUserId || '');

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const stats = data?.stats || [];
  const totalUsers = data?.total || 0;
  const activeUsers = stats.find((s: any) => s.status === 'active')?._count || 0;
  const adminCount = stats.find((s: any) => s.role === 'ADMIN')?._count || 0;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Users Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage all users, roles, and permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Administrators
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{adminCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              New This Month
            </CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {/* Calculate new users this month */}
              0
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            onViewUser={setSelectedUserId}
            onEditUser={setEditUserId}
            onMessageUser={setMessageUserId}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onEdit={() => {
            setEditUserId(selectedUserId);
            setSelectedUserId(null);
          }}
          onMessage={() => {
            setMessageUserId(selectedUserId);
            setSelectedUserId(null);
          }}
        />
      )}

      {messageUserId && (
        <SendMessageModal
          userId={messageUserId}
          onClose={() => setMessageUserId(null)}
        />
      )}

      {editUserId && editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUserId(null)}
        />
      )}
    </div>
  );
}
