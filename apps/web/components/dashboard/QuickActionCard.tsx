'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

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
    <a
      href={href}
      className={`group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary-200 hover:shadow-md ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 transition-colors group-hover:bg-primary-100">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-600" />
    </a>
  );
}
