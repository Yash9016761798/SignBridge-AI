'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel = 'from last period',
  icon: Icon,
  className = '',
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-card bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 dark:bg-surface-900 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-brand-soft transition-colors group-hover:bg-gradient-brand-medium">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {isPositive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-bold text-surface-700">
              <TrendingUp className="h-3 w-3" />+{change}%
            </span>
          ) : isNegative ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2.5 py-0.5 text-xs font-bold text-danger-600">
              <TrendingDown className="h-3 w-3" />
              {change}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-0.5 text-xs font-bold text-surface-500">
              <Minus className="h-3 w-3" />
              0%
            </span>
          )}
          <span className="text-xs text-surface-500 dark:text-surface-400">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
