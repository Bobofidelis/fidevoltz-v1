"use client";

import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils/currency";

export function UserOverview() {
  const user = useAuthStore((state) => state.user);

  // Debug log
  console.log("🟢 USER OVERVIEW COMPONENT IS RENDERING");

  const stats = {
    totalOrders: 3,
    activeOrders: 1,
    completedOrders: 2,
    totalSpent: 121.95,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          🟢 My Dashboard <span className="text-sm text-green-600">(USER VIEW)</span>
        </h2>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Order #TRK-2024-002</p>
                  <p className="text-xs text-muted-foreground">2 items - ₦38,980</p>
                </div>
                <span className="text-sm text-blue-600 font-medium">Shipped</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Order #TRK-2024-001</p>
                  <p className="text-xs text-muted-foreground">2 items - ₦38,980</p>
                </div>
                <span className="text-sm text-green-600 font-medium">Delivered</span>
              </div>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full mt-4">
                View All Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/store">
              <Button variant="outline" className="w-full">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Store
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Track Orders
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
