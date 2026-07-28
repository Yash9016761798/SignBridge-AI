'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count?: number;
  className?: string;
}

export default function NotificationBell({ count = 0, className = '' }: NotificationBellProps) {
  return (
    <button
      className={`relative rounded-[12px] p-2.5 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-300 ${className}`}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
