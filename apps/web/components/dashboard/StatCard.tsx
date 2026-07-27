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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-2xl border border-surface-200 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 dark:border-surface-800 dark:bg-surface-900 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white">
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 transition-colors group-hover:bg-primary-100 dark:bg-primary-950/50 dark:group-hover:bg-primary-900/50">
            <Icon className="h-6 w-6 text-primary-500" />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          {isPositive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-600 dark:bg-success-500/10">
              <TrendingUp className="h-3 w-3" />+{change}%
            </span>
          ) : isNegative ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-2 py-0.5 text-xs font-semibold text-danger-600 dark:bg-danger-500/10">
              <TrendingDown className="h-3 w-3" />
              {change}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2 py-0.5 text-xs font-semibold text-surface-500 dark:bg-surface-800">
              <Minus className="h-3 w-3" />
              0%
            </span>
          )}
          <span className="text-xs text-surface-400 dark:text-surface-500">{changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}
