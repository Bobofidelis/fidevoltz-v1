"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Calendar, Shield, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { RoleGuard } from "@/components/guards/role-guard";

export default function UserDetailPage() {
  // Mock user data
  const user = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    role: "USER",
    avatar: null,
    createdAt: "2024-01-01",
    orders: 5,
    totalSpent: 450.00,
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
            <p className="text-muted-foreground">View and manage user information</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <Badge>{user.role}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{user.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{user.orders}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">₦</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">₦{user.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage user account and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Change Role</h4>
                <p className="text-sm text-muted-foreground">Update user permissions</p>
              </div>
              <Button variant="outline">Change Role</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reset Password</h4>
                <p className="text-sm text-muted-foreground">Send password reset email</p>
              </div>
              <Button variant="outline">Reset Password</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Suspend Account</h4>
                <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
              </div>
              <Button variant="destructive">Suspend</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
