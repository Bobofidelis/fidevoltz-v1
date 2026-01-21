"use client";

import { useState } from 'react';
import { useUserDetails, useUserActivity, useUserMessages, useUpdateUser } from '@/lib/hooks/use-admin-users';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Edit, MessageSquare, Activity, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role } from '@prisma/client';

interface UserDetailsModalProps {
  userId: string;
  onClose: () => void;
  onEdit: () => void;
  onMessage: () => void;
}

export function UserDetailsModal({ userId, onClose, onEdit, onMessage }: UserDetailsModalProps) {
  const { data: user, isLoading } = useUserDetails(userId);
  const { data: activities } = useUserActivity(userId);
  const { data: messages } = useUserMessages(userId);
  const updateUser = useUpdateUser();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (isLoading || !user) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            Loading user details...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleRoleChange = (newRole: Role) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      updateUser.mutate({ userId, data: { role: newRole } });
    }
  };

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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {/* User Header */}
        <div className="flex items-start gap-4 pb-4 border-b">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
              {user.name?.substring(0, 2).toUpperCase() || user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{user.name || 'No name'}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={cn("font-medium", getRoleBadgeColor(user.role))}>
                {user.role}
              </Badge>
              <span className={cn("text-sm font-medium capitalize", 
                user.status === 'active' ? 'text-green-600' : 'text-gray-600'
              )}>
                ● {user.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders ({user._count.orders})</TabsTrigger>
            <TabsTrigger value="activity">Activity ({user._count.activities})</TabsTrigger>
            <TabsTrigger value="messages">Messages ({messages?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Last Login
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    {user.lastLoginAt
                      ? formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })
                      : 'Never'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user._count.orders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${Number(user.totalSpent || 0).toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Role Management */}
            <Card>
              <CardHeader>
                <CardTitle>Role Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Change user role:</span>
                  <div className="flex gap-2">
                    {(['USER', 'EDITOR', 'ADMIN'] as Role[]).map((role) => (
                      <Button
                        key={role}
                        variant={user.role === role ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleRoleChange(role)}
                        disabled={user.role === role}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            {user.orders && user.orders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user.orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">#{order.id.substring(0, 8)}</div>
                          <div className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${Number(order.totalAmount).toFixed(2)}</div>
                          <Badge variant="outline" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardContent className="pt-6">
                {user.orders && user.orders.length > 0 ? (
                  <div className="space-y-2">
                    {user.orders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div>
                          <div className="font-medium">Order #{order.id.substring(0, 8)}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${Number(order.totalAmount).toFixed(2)}</div>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No orders yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="pt-6">
                {activities && activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-3 p-3 border-l-2 border-blue-500 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium capitalize">{activity.action.replace(/_/g, ' ')}</div>
                          {activity.description && (
                            <div className="text-sm text-gray-600 mt-1">{activity.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No activity yet</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardContent className="pt-6">
                {messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Conversation Thread */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {messages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "p-4 rounded-lg",
                            msg.sender.role === 'ADMIN' ? 'bg-purple-50 ml-8' : 'bg-blue-50 mr-8'
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium">{msg.subject || 'No subject'}</div>
                              <div className="text-xs text-gray-500">
                                From: {msg.sender.name || msg.sender.email}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Section */}
                    <div className="border-t pt-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={onMessage}
                        className="w-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send New Message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">No messages yet</div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={onMessage}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Conversation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
