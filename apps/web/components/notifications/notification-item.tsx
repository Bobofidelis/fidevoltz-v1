"use client";

import { useRouter } from 'next/navigation';
import { formatTimeAgo, getNotificationConfig, getPriorityConfig } from '@/lib/utils/notification-helpers';
import { useMarkAsRead, useDeleteNotification } from '@/lib/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: any;
  onRead?: () => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const config = getNotificationConfig(notification.type);
  const priorityConfig = getPriorityConfig(notification.priority);

  const handleClick = () => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    onRead?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md",
        !notification.isRead && "bg-blue-50 border-blue-200",
        notification.isRead && "bg-white hover:bg-gray-50",
        priorityConfig.border,
        priorityConfig.bg
      )}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute top-4 left-2 w-2 h-2 bg-blue-600 rounded-full" />
      )}

      <div className="flex gap-3 ml-2">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-lg",
          config.iconBg
        )}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={cn(
                "text-sm font-medium",
                !notification.isRead && "font-semibold"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleMarkAsRead}
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </span>
            {notification.actionLabel && (
              <span className="text-xs text-blue-600 font-medium">
                {notification.actionLabel} →
              </span>
            )}
            {notification.priority !== 'normal' && (
              <span className={cn("text-xs font-medium", priorityConfig.color)}>
                {priorityConfig.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
