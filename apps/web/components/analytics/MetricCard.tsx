"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  format = 'number',
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${val.toFixed(2)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{formatValue(value)}</p>
            {change !== undefined && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isPositive ? "+" : ""}{change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-2">vs last period</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-lg", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
