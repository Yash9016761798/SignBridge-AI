'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export default function ChartCard({ title, icon: Icon, children, className = '', action }: ChartCardProps) {
  return (
    <div className={`rounded-card bg-white p-6 shadow-card dark:bg-surface-900 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-white">
          {Icon && <Icon className="h-4 w-4 text-primary-500" />}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
