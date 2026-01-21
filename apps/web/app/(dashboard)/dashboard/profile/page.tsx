"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Image as ImageIcon, Lock, Settings, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { useProfile } from "@/lib/hooks/use-profile";
import { AvatarSelector } from "@/components/profile/avatar-selector";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { AdminSettings } from "@/components/profile/admin-settings";
import { format } from "date-fns";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: profile, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("profile");

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile || !session?.user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const isAdmin = session.user.role === "ADMIN";
  const isEditor = session.user.role === "EDITOR";

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Profile Settings</h2>
          <p className="text-blue-100">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Overview Card - Enhanced */}
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar with Ring */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50"></div>
              <Avatar className="relative h-32 w-32 ring-4 ring-white shadow-xl">
                <AvatarImage 
                  src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} 
                />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {profile.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-3xl font-bold">{profile.name}</h3>
                <Badge 
                  variant={isAdmin ? "default" : isEditor ? "secondary" : "outline"}
                  className="text-sm px-3 py-1"
                >
                  {profile.role}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.phoneNumber && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</span>
                </div>
              </div>

              {profile.bio && (
                <p className="text-muted-foreground text-sm mt-3 p-3 bg-slate-50 rounded-lg border">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface - Enhanced */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-slate-100">
          <TabsTrigger 
            value="profile" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger 
            value="avatar" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Avatar</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger 
              value="admin" 
              className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm profile={profile} />
          
          {/* Editor-specific features */}
          {isEditor && (
            <Card className="border-l-4 border-l-blue-600">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Editor Privileges</h4>
                    <p className="text-sm text-muted-foreground">
                      You have extended bio length (500 characters) and access to content management features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="avatar" className="space-y-4">
          <AvatarSelector 
            currentAvatar={profile.avatar} 
            userEmail={profile.email} 
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <PasswordForm />
          
          {/* Security Info */}
          <Card className="border-l-4 border-l-green-600">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Security Best Practices</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow these tips to keep your account secure
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground ml-12">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Use a strong, unique password with at least 8 characters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Change your password regularly (every 3-6 months)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Never share your password with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Review your account activity regularly</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="space-y-4">
            <AdminSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-lg" />
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
