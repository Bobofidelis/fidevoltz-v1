"use client";

import { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUpdateOrderStatus } from '@/lib/hooks/use-orders';
import { getValidNextStatuses, ORDER_STATUS_CONFIG } from '@/lib/utils/order-helpers';
import { Loader2 } from 'lucide-react';

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const updateStatus = useUpdateOrderStatus();

  const validStatuses = getValidNextStatuses(currentStatus);

  const handleUpdate = () => {
    if (!selectedStatus) return;

    updateStatus.mutate(
      { orderId, status: selectedStatus as OrderStatus, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setSelectedStatus('');
          setNote('');
        },
      }
    );
  };

  if (validStatuses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No status updates available for this order
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Order Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>New Status</Label>
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {validStatuses.map((status) => {
                const config = ORDER_STATUS_CONFIG[status];
                return (
                  <SelectItem key={status} value={status}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Note (Optional)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this status change..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleUpdate}
          disabled={!selectedStatus || updateStatus.isPending}
          className="w-full"
        >
          {updateStatus.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Status'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
