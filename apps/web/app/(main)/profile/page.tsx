"use client";

import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Shield } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-2xl font-bold">Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-32 w-32 border-4 border-slate-100">
                <AvatarImage src={user.avatar?.startsWith('http') ? user.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="break-all">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span className="capitalize">{user.role.toLowerCase()} Account</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Member since {new Date().getFullYear()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input id="name" defaultValue={user.name} disabled className="pl-9 bg-slate-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input id="email" defaultValue={user.email} disabled className="pl-9 bg-slate-50" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Security</h3>
              <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
