'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({
  title,
  icon: Icon,
  action,
  children,
  className = '',
}: DashboardCardProps) {
  return (
    <div className={`rounded-card bg-white shadow-card dark:bg-surface-900 ${className}`}>
      <div className="flex items-center justify-between border-b border-surface-100 px-6 py-4 dark:border-surface-800">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-gradient-brand-soft">
              <Icon className="h-4 w-4 text-primary-600" />
            </div>
          )}
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
