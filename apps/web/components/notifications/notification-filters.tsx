"use client";

import { useState } from 'react';
import { NotificationType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationFiltersProps {
  selectedType: NotificationType | 'ALL';
  onTypeChange: (type: NotificationType | 'ALL') => void;
  selectedRead: 'all' | 'unread' | 'read';
  onReadChange: (status: 'all' | 'unread' | 'read') => void;
}

const TYPES: Array<{ value: NotificationType | 'ALL'; label: string; icon: string }> = [
  { value: 'ALL', label: 'All', icon: '📋' },
  { value: 'ORDER', label: 'Orders', icon: '📦' },
  { value: 'PRODUCT', label: 'Products', icon: '🛍️' },
  { value: 'MESSAGE', label: 'Messages', icon: '💬' },
  { value: 'SYSTEM', label: 'System', icon: '⚙️' },
  { value: 'ANNOUNCEMENT', label: 'Announcements', icon: '📢' },
];

export function NotificationFilters({
  selectedType,
  onTypeChange,
  selectedRead,
  onReadChange,
}: NotificationFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map(type => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange(type.value)}
            className={cn(
              "transition-all",
              selectedType === type.value && "shadow-md"
            )}
          >
            <span className="mr-1.5">{type.icon}</span>
            {type.label}
          </Button>
        ))}
      </div>

      {/* Read status filters */}
      <div className="flex gap-2">
        <Button
          variant={selectedRead === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onReadChange('all')}
        >
          All
        </Button>
        <Button
          variant={selectedRead === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onReadChange('unread')}
        >
          Unread
        </Button>
        <Button
          variant={selectedRead === 'read' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onReadChange('read')}
        >
          Read
        </Button>
      </div>
    </div>
  );
}
