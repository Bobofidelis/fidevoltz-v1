"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface Activity {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  createdAt: Date | string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user?.avatar} />
                  <AvatarFallback>
                    {activity.user?.name?.[0] || activity.user?.email?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user?.name || "Someone"}</span>
                    {" "}
                    <span className="text-muted-foreground">{activity.action}</span>
                    {" "}
                    <span className="font-medium">{activity.resource}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
