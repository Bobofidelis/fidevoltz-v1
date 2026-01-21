"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUpdateProfile } from "@/lib/hooks/use-profile";

interface ProfileFormProps {
  profile: {
    name?: string | null;
    email: string;
    role: string;
    phoneNumber?: string | null;
    address?: string | null;
    bio?: string | null;
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    phoneNumber: profile.phoneNumber || "",
    address: profile.address || "",
    bio: profile.bio || "",
  });

  const updateProfile = useUpdateProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const hasChanges = 
    formData.name !== (profile.name || "") ||
    formData.phoneNumber !== (profile.phoneNumber || "") ||
    formData.address !== (profile.address || "") ||
    formData.bio !== (profile.bio || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-slate-50"
              />
              <Badge className="absolute right-2 top-2" variant="secondary">
                {profile.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Contact support to change your email
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+234 801 234 5678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, Lagos, Nigeria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={profile.role === "EDITOR" ? 500 : 200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/{profile.role === "EDITOR" ? 500 : 200} characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!hasChanges || updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                name: profile.name || "",
                phoneNumber: profile.phoneNumber || "",
                address: profile.address || "",
                bio: profile.bio || "",
              })}
              disabled={!hasChanges}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
