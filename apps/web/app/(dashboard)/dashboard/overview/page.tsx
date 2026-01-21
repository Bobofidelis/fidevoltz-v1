"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, ShoppingCart, Users, Bell, AlertTriangle, 
  Package, TrendingUp, Activity, Loader2 
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useOverviewStats, useActivityFeed, useNotifications } from "@/lib/hooks/use-overview";
import Link from "next/link";

export default function OverviewPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  const { data: stats, isLoading: statsLoading } = useOverviewStats();
  const { data: activities, isLoading: activitiesLoading } = useActivityFeed(15);
  const { data: notifications } = useNotifications(5);

  // Show user-friendly dashboard for non-admin users
  if (!isAdmin) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Your personal dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">My Orders</p>
                    <p className="text-sm text-muted-foreground">View your order history</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">My Profile</p>
                    <p className="text-sm text-muted-foreground">Manage your account</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/store">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Shop Now</p>
                    <p className="text-sm text-muted-foreground">Browse our products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time insights and platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`₦${stats?.todayRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          description="Revenue generated today"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={Users}
          description="Users active today"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={ShoppingCart}
          description="Awaiting processing"
        />
        <StatCard
          title="Unread Messages"
          value={stats?.unreadMessages || 0}
          icon={Bell}
          description="New messages"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Notifications"
          value={stats?.newNotifications || 0}
          icon={Bell}
          description="Unread notifications"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          description="Products need restocking"
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          icon={Package}
          description="Orders placed today"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.conversionRate || 0}%`}
          icon={TrendingUp}
          description="Visitor to customer"
        />
      </div>

      {/* Activity Feed and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activities || []} isLoading={activitiesLoading} />
        
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              {notifications && notifications.length > 0 ? (
                notifications.map((notif: any) => (
                  <div key={notif.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No new notifications
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/products/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">Create Product</p>
                  <p className="text-sm text-muted-foreground">Add new product</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-sm text-muted-foreground">Detailed insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Manage Orders</p>
                  <p className="text-sm text-muted-foreground">Process orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
