"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications, useMarkAllAsRead } from '@/lib/hooks/use-notifications';
import { NotificationsList } from '@/components/notifications/notifications-list';
import { NotificationFilters } from '@/components/notifications/notification-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { NotificationType } from '@prisma/client';

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState<NotificationType | 'ALL'>('ALL');
  const [selectedRead, setSelectedRead] = useState<'all' | 'unread' | 'read'>('all');
  
  const { data, isLoading } = useNotifications({
    type: selectedType !== 'ALL' ? selectedType : undefined,
    isRead: selectedRead === 'all' ? undefined : selectedRead === 'read',
  });

  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your latest activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Bell className="h-4 w-4" />
              {unreadCount} unread
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      {unreadCount > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    Click on any notification to view details
                  </p>
                </div>
              </div>
              <Button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                variant="outline"
                size="sm"
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                Mark all as read
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationFilters
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedRead={selectedRead}
            onReadChange={setSelectedRead}
          />
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <NotificationsList notifications={notifications} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
