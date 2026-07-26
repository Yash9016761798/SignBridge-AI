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
      className={`relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 ${className}`}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
