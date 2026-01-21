"use client";

import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Clock, CheckCircle } from "lucide-react";

export function EditorOverview() {
  const user = useAuthStore((state) => state.user);

  const stats = {
    pendingOrders: 12,
    completedToday: 8,
    totalProducts: 48,
    needsReview: 5,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Editor Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.needsReview}</div>
            <p className="text-xs text-muted-foreground">Items to check</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Orders requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order #1234</p>
                <p className="text-xs text-muted-foreground">John Doe - 2 items</p>
              </div>
              <span className="text-sm text-yellow-600 font-medium">Processing</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order #1233</p>
                <p className="text-xs text-muted-foreground">Jane Smith - 1 item</p>
              </div>
              <span className="text-sm text-blue-600 font-medium">Shipped</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
