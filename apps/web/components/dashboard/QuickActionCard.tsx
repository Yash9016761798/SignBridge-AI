'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  className = '',
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={href}
        className={`group flex items-center gap-4 rounded-card bg-white p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary-200 border border-transparent dark:bg-surface-900 dark:hover:border-primary-800 ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-brand-soft transition-colors group-hover:bg-gradient-brand-medium">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">{title}</h3>
          <p className="mt-0.5 text-xs text-surface-500">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-surface-300 transition-all group-hover:translate-x-1 group-hover:text-primary-500" />
      </Link>
    </motion.div>
  );
}
