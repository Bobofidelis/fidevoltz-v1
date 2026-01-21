"use client";

import { Card, CardContent } from '@/components/ui/card';
import { calculateOrderStats, formatCurrency } from '@/lib/utils/order-helpers';
import { Package, Clock, Truck, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface OrdersStatsProps {
  orders: any[];
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  const stats = calculateOrderStats(orders);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'In Transit',
      value: stats.inTransit + stats.shipped,
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Completed',
      value: stats.completed + stats.delivered,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      isRevenue: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">
                  {stat.isRevenue ? stat.value : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
