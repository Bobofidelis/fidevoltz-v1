"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Bell, Activity, Shield } from "lucide-react";

export function AdminSettings() {
  return (
    <div className="space-y-6">
      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>API Keys</CardTitle>
          </div>
          <CardDescription>Manage your API keys for integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">Production API Key</p>
              <p className="text-sm text-muted-foreground font-mono">
                fv_prod_••••••••••••••••
              </p>
            </div>
            <Button variant="outline" size="sm">Regenerate</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">Development API Key</p>
              <p className="text-sm text-muted-foreground font-mono">
                fv_dev_••••••••••••••••
              </p>
            </div>
            <Button variant="outline" size="sm">Regenerate</Button>
          </div>
          <Button variant="outline" className="w-full">
            <Key className="h-4 w-4 mr-2" />
            Create New API Key
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates for important events
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when orders are placed or updated
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Product Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Low stock and product-related notifications
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Login attempts and security-related events
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>Your recent account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: "Password changed", time: "2 hours ago", type: "security" },
              { action: "Profile updated", time: "1 day ago", type: "profile" },
              { action: "New login from Chrome", time: "2 days ago", type: "security" },
              { action: "API key regenerated", time: "1 week ago", type: "api" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <Badge variant="secondary">{activity.type}</Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Full Activity Log
          </Button>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>Advanced admin settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable maintenance mode for the entire site
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Debug Mode</Label>
              <p className="text-sm text-muted-foreground">
                Show detailed error messages (development only)
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
