"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend.isPositive ? (
              <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>
              {Math.abs(trend.value)}%
            </span>
            <span className="ml-1">{description || "from last period"}</span>
          </p>
        )}
        {description && !trend && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
