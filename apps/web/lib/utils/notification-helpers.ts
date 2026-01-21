import { NotificationType } from '@prisma/client';

// Notification type configuration
export const NOTIFICATION_CONFIG = {
  ORDER: {
    label: 'Order',
    icon: '📦',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconBg: 'bg-blue-500',
  },
  PRODUCT: {
    label: 'Product',
    icon: '🛍️',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-500',
  },
  MESSAGE: {
    label: 'Message',
    icon: '💬',
    color: 'bg-green-100 text-green-800 border-green-200',
    iconBg: 'bg-green-500',
  },
  SYSTEM: {
    label: 'System',
    icon: '⚙️',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconBg: 'bg-gray-500',
  },
  ANNOUNCEMENT: {
    label: 'Announcement',
    icon: '📢',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconBg: 'bg-orange-500',
  },
  COMMENT: {
    label: 'Comment',
    icon: '💭',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    iconBg: 'bg-cyan-500',
  },
} as const;

// Priority configuration
export const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'text-gray-600',
    border: '',
    bg: '',
  },
  normal: {
    label: 'Normal',
    color: 'text-blue-600',
    border: '',
    bg: '',
  },
  high: {
    label: 'High',
    color: 'text-orange-600',
    border: 'border-l-4 border-orange-500',
    bg: '',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-600',
    border: 'border-l-4 border-red-500',
    bg: 'bg-red-50',
  },
} as const;

// Get notification config
export function getNotificationConfig(type: NotificationType) {
  return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.SYSTEM;
}

// Get priority config
export function getPriorityConfig(priority: string) {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.normal;
}

// Format time ago
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

// Group notifications by date
export function groupNotificationsByDate(notifications: any[]) {
  const groups: Record<string, any[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    if (date >= today) {
      groups.today.push(notification);
    } else if (date >= yesterday) {
      groups.yesterday.push(notification);
    } else if (date >= thisWeek) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }
  });

  return groups;
}
