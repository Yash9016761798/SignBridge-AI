'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  accentColor?: 'pink' | 'sky' | 'mint' | 'amber' | 'yellow';
}

const accentMap = {
  pink: 'bg-primary-50 dark:bg-primary-500/10',
  sky: 'bg-info-50 dark:bg-info-500/10',
  mint: 'bg-success-50 dark:bg-success-500/10',
  amber: 'bg-warning-50 dark:bg-warning-500/10',
  yellow: 'bg-secondary-50 dark:bg-secondary-500/10',
};

const iconColorMap = {
  pink: 'text-primary-400',
  sky: 'text-info-500',
  mint: 'text-success-500',
  amber: 'text-warning-500',
  yellow: 'text-secondary-400',
};

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
  accentColor = 'pink',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${accentMap[accentColor]}`}
      >
        <Icon className={`h-8 w-8 ${iconColorMap[accentColor]}`} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-center text-sm text-surface-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
