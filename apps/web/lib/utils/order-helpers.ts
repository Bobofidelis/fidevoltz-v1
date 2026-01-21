import { OrderStatus } from '@prisma/client';

// Status configuration with colors and icons
export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏳',
    description: 'Order received, awaiting processing',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '⚙️',
    description: 'Order is being prepared',
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '📦',
    description: 'Order has been shipped',
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🚚',
    description: 'Order is on the way',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: '🚛',
    description: 'Order is out for delivery',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅',
    description: 'Order has been delivered',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '⭐',
    description: 'Order completed successfully',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '❌',
    description: 'Order has been cancelled',
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '💰',
    description: 'Order has been refunded',
  },
} as const;

// Admin can change to any status at any time - no restrictions
export function getValidNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
  // Return all statuses except the current one
  return Object.keys(ORDER_STATUS_CONFIG).filter(
    (status) => status !== currentStatus
  ) as OrderStatus[];
}

// Get status configuration
export function getStatusConfig(status: OrderStatus) {
  return ORDER_STATUS_CONFIG[status];
}

// Format order number for display
export function formatOrderNumber(orderId: string): string {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}

// Calculate order statistics
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  inTransit: number;
  delivered: number;
  completed: number;
  cancelled: number;
  refunded: number;
  revenue: number;
}

export function calculateOrderStats(orders: any[]): OrderStats {
  const stats: OrderStats = {
    total: orders.length,
    pending: 0,
    processing: 0,
    shipped: 0,
    inTransit: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
    revenue: 0,
  };

  orders.forEach((order) => {
    // Count by status
    switch (order.status) {
      case 'PENDING':
        stats.pending++;
        break;
      case 'PROCESSING':
        stats.processing++;
        break;
      case 'SHIPPED':
        stats.shipped++;
        break;
      case 'IN_TRANSIT':
        stats.inTransit++;
        break;
      case 'DELIVERED':
        stats.delivered++;
        break;
      case 'COMPLETED':
        stats.completed++;
        break;
      case 'CANCELLED':
        stats.cancelled++;
        break;
      case 'REFUNDED':
        stats.refunded++;
        break;
    }

    // Calculate revenue (exclude cancelled and refunded)
    if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
      stats.revenue += Number(order.totalAmount);
    }
  });

  return stats;
}

// Check if user can update order
export function canUpdateOrder(userRole: string, orderUserId: string, currentUserId: string): boolean {
  if (userRole === 'ADMIN') return true;
  return orderUserId === currentUserId;
}

// Check if user can change order status
export function canChangeOrderStatus(userRole: string): boolean {
  return userRole === 'ADMIN';
}

// Format currency
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

// Get status progress percentage
export function getStatusProgress(status: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    PENDING: 10,
    PROCESSING: 25,
    SHIPPED: 40,
    IN_TRANSIT: 60,
    OUT_FOR_DELIVERY: 80,
    DELIVERED: 90,
    COMPLETED: 100,
    CANCELLED: 0,
    REFUNDED: 0,
  };
  return progressMap[status] || 0;
}
