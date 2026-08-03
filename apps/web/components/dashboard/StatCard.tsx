'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export type StatCardVariant = 'rose' | 'yellow' | 'sky' | 'mint' | 'default';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  className?: string;
}

const variantMap: Record<
  StatCardVariant,
  {
    hex: string;
    titleText: string;
    valueText: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  rose: {
    hex: '#E9A8C9',
    titleText: 'text-[#111111]/80 font-bold',
    valueText: 'text-[#111111]',
    iconBg: 'bg-[#111111]',
    iconColor: 'text-[#E9A8C9]',
    badgeBg: 'bg-[#111111]/15',
    badgeText: 'text-[#111111]',
  },
  yellow: {
    hex: '#F6D365',
    titleText: 'text-[#111111]/80 font-bold',
    valueText: 'text-[#111111]',
    iconBg: 'bg-[#111111]',
    iconColor: 'text-[#F6D365]',
    badgeBg: 'bg-[#111111]/15',
    badgeText: 'text-[#111111]',
  },
  sky: {
    hex: '#A9D6F5',
    titleText: 'text-[#111111]/80 font-bold',
    valueText: 'text-[#111111]',
    iconBg: 'bg-[#111111]',
    iconColor: 'text-[#A9D6F5]',
    badgeBg: 'bg-[#111111]/15',
    badgeText: 'text-[#111111]',
  },
  mint: {
    hex: '#B8E6C3',
    titleText: 'text-[#111111]/80 font-bold',
    valueText: 'text-[#111111]',
    iconBg: 'bg-[#111111]',
    iconColor: 'text-[#B8E6C3]',
    badgeBg: 'bg-[#111111]/15',
    badgeText: 'text-[#111111]',
  },
  default: {
    hex: '#FFFFFF',
    titleText: 'text-gray-500',
    valueText: 'text-[#111111] dark:text-white',
    iconBg: 'bg-[#111111]',
    iconColor: 'text-[#E9A8C9]',
    badgeBg: 'bg-[#B8E6C3]/40',
    badgeText: 'text-[#111111]',
  },
};

export default function StatCard({
  title,
  value,
  change,
  changeLabel = 'from last period',
  icon: Icon,
  variant = 'default',
  className = '',
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const conf = variantMap[variant] || variantMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ backgroundColor: conf.hex }}
      className={`group rounded-[24px] p-6 shadow-sm border border-black/5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p
            className={`font-control-inactive text-xs font-extrabold uppercase tracking-wider ${conf.titleText}`}
          >
            {title}
          </p>
          <p className={`font-heading text-3xl font-extrabold tracking-tight ${conf.valueText}`}>
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${conf.iconBg} shadow-sm transition-transform group-hover:scale-105 flex-shrink-0`}
          >
            <Icon className={`h-6 w-6 ${conf.iconColor}`} />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          {isPositive ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full ${conf.badgeBg} px-2.5 py-0.5 text-xs font-bold ${conf.badgeText}`}
            >
              <TrendingUp className="h-3 w-3" />+{change}%
            </span>
          ) : isNegative ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
              <TrendingDown className="h-3 w-3" />
              {change}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
              <Minus className="h-3 w-3" />
              0%
            </span>
          )}
          <span
            className={`font-body text-xs ${variant !== 'default' ? 'text-[#111111]/70 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {changeLabel}
          </span>
        </div>
      )}
    </motion.div>
  );
}
