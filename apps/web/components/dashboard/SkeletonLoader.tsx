"use client";

import { Card } from "@/components/ui/card";

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className || ''}`}>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-4 w-4 bg-muted rounded"></div>
        </div>
        <div className="h-8 bg-muted rounded w-32 mb-2"></div>
        <div className="h-3 bg-muted rounded w-20"></div>
      </div>
    </Card>
  );
}

export function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <Card className="p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded w-40 mb-4"></div>
        <div className={`bg-muted rounded`} style={{ height: `${height}px` }}></div>
      </div>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-8 w-8 bg-muted-foreground/20 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted-foreground/20 rounded w-1/3"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-6 bg-muted-foreground/20 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}
