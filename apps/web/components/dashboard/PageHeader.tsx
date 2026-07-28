'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start justify-between ${className}`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-brand-soft">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 dark:text-white">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-surface-500">{description}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  );
}
