"use client";

import { OrderStatus } from '@prisma/client';
import { ORDER_STATUS_CONFIG } from '@/lib/utils/order-helpers';
import { Badge } from '@/components/ui/badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  className?: string;
}

export function OrderStatusBadge({ status, showIcon = true, className = '' }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <Badge
      variant="outline"
      className={`${config.color} border ${className}`}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
}
