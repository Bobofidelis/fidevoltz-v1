"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useOrders } from '@/lib/hooks/use-orders';
import { OrdersStats } from '@/components/orders/orders-stats';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatOrderNumber, ORDER_STATUS_CONFIG } from '@/lib/utils/order-helpers';
import { Search, Filter, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function OrdersPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    search: '',
  });

  const { data, isLoading } = useOrders({
    ...filters,
    status: filters.status === 'all' ? '' : filters.status,
  });
  const orders = data?.data || [];
  const pagination = data?.pagination;

  const isAdmin = session?.user?.role === 'ADMIN';

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {isAdmin ? 'Orders Management' : 'My Orders'}
        </h1>
        <p className="text-blue-100">
          {isAdmin ? 'Track and manage all customer orders' : 'View and track your orders'}
        </p>
      </div>

      {/* Stats */}
      {orders.length > 0 && <OrdersStats orders={orders} />}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            {isAdmin && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID, customer name or email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filters.status !== 'all' || filters.search ? (
              <Button
                variant="outline"
                onClick={() => setFilters({ page: 1, limit: 10, status: 'all', search: '' })}
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Order</th>
                    {isAdmin && <th className="text-left p-4 font-medium">Customer</th>}
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Total</th>
                    <th className="text-left p-4 font-medium">Items</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{formatOrderNumber(order.id)}</p>
                          {order.trackingNumber && (
                            <p className="text-xs text-muted-foreground">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{order.user.name || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{order.user.email}</p>
                          </div>
                        </td>
                      )}
                      <td className="p-4 text-sm">
                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
