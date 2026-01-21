"use client";

import { groupNotificationsByDate } from '@/lib/utils/notification-helpers';
import { NotificationItem } from './notification-item';
import { Bell } from 'lucide-react';

interface NotificationsListProps {
  notifications: any[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
        <p className="text-sm text-gray-500">
          You're all caught up! Check back later for updates.
        </p>
      </div>
    );
  }

  const grouped = groupNotificationsByDate(notifications);

  return (
    <div className="space-y-6">
      {grouped.today.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Today</h3>
          <div className="space-y-2">
            {grouped.today.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}

      {grouped.yesterday.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Yesterday</h3>
          <div className="space-y-2">
            {grouped.yesterday.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}

      {grouped.thisWeek.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">This Week</h3>
          <div className="space-y-2">
            {grouped.thisWeek.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}

      {grouped.older.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Older</h3>
          <div className="space-y-2">
            {grouped.older.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
