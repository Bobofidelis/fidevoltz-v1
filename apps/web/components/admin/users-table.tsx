"use client";

import { useState } from 'react';
import { Role } from '@prisma/client';
import { useUsers, useDeleteUser } from '@/lib/hooks/use-admin-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MoreVertical, Trash2, Edit, MessageSquare, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface UsersTableProps {
  onViewUser: (userId: string) => void;
  onEditUser: (userId: string) => void;
  onMessageUser: (userId: string) => void;
}

export function UsersTable({ onViewUser, onEditUser, onMessageUser }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers({
    search,
    role: roleFilter,
    page,
    limit: 20,
  });

  const deleteUser = useDeleteUser();

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EDITOR':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-600';
      case 'suspended':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | 'ALL')}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
          <option value="EDITOR">Editors</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {user.name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || 'No name'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-medium", getRoleBadgeColor(user.role))}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={cn("font-medium capitalize", getStatusColor(user.status))}>
                      ● {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.lastLoginAt
                      ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{user._count.orders}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewUser(user.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser(user.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onMessageUser(user.id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm('Are you sure you want to deactivate this user?')) {
                              deleteUser.mutate(user.id);
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
