"use client";

import { format } from 'date-fns';
import { ORDER_STATUS_CONFIG } from '@/lib/utils/order-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatus } from '@prisma/client';

interface OrderTimelineProps {
  history: Array<{
    id: string;
    status: OrderStatus;
    note?: string | null;
    createdAt: Date | string;
    user?: {
      name?: string | null;
      email?: string;
    } | null;
  }>;
}

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No status history available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

          {history.map((entry, index) => {
            const config = ORDER_STATUS_CONFIG[entry.status];
            const isLast = index === history.length - 1;

            return (
              <div key={entry.id} className="relative flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-slate-200">
                  <span className="text-lg">{config.icon}</span>
                </div>

                {/* Content */}
                <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{config.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                      {entry.note && (
                        <p className="mt-1 text-sm text-slate-600 italic">
                          Note: {entry.note}
                        </p>
                      )}
                      {entry.user && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Updated by {entry.user.name || entry.user.email}
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(entry.createdAt), 'MMM d, h:mm a')}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
