"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container py-16 text-center max-w-md mx-auto">
        <User className="h-16 w-16 mx-auto mb-4 text-slate-300" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view your profile</h2>
        <p className="text-slate-500 mb-6">You need to be logged in to access your account settings.</p>
        <Link href="/auth/login?callbackUrl=/profile">
          <Button size="lg">Sign In</Button>
        </Link>
      </div>
    );
  }

  const user = session.user;
  const avatarSrc = (user as any).avatar?.startsWith("http")
    ? (user as any).avatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-32 w-32 border-4 border-slate-100">
                <AvatarImage src={avatarSrc} alt={user.name || "User"} />
                <AvatarFallback className="text-4xl">{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="break-all">{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span className="capitalize">{((user as any).role || "user").toLowerCase()} Account</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Member since {new Date().getFullYear()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input id="name" defaultValue={user.name || ""} disabled className="pl-9 bg-slate-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input id="email" defaultValue={user.email || ""} disabled className="pl-9 bg-slate-50" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard/profile">
                  <Button className="w-full sm:w-auto">Edit Profile</Button>
                </Link>
                <Link href="/auth/change-password">
                  <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "My Orders", href: "/orders" },
                { label: "Track Order", href: "/track-order" },
                { label: "Dashboard", href: "/dashboard/overview" },
                { label: "Notifications", href: "/dashboard/notifications" },
                { label: "Support Tickets", href: "/dashboard/my-tickets" },
                { label: "My Reviews", href: "/dashboard/my-reviews" },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="outline" className="w-full text-sm h-auto py-2">{link.label}</Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
