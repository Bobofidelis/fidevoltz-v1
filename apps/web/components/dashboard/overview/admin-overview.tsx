"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, ShoppingCart, Users, AlertCircle } from "lucide-react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { formatNaira } from "@/lib/utils/currency";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

export function AdminOverview() {
  const { data: stats, isLoading, error } = useApiQuery<DashboardStats>({
    endpoint: '/api/dashboard',
    queryKey: ['dashboard', 'overview'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.recentOrders?.length || 0} recent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest orders and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.slice(0, 3).map((order: any) => (
                <div key={order.id} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.user?.name || 'Customer'}</p>
                  </div>
                  <span className="text-sm font-medium">{formatNaira(order.totalAmount)}</span>
                </div>
              )) || <p className="text-sm text-muted-foreground">No recent orders</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>Products needing restock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.lowStockProducts?.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex items-center gap-4">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.stock} units remaining</p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">All products well stocked</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
