'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export type QuickActionVariant = 'rose' | 'yellow' | 'sky' | 'mint' | 'default';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?: QuickActionVariant;
  className?: string;
}

const variantStyles: Record<QuickActionVariant, { hex: string; iconColor: string }> = {
  rose: { hex: '#E9A8C9', iconColor: 'text-[#E9A8C9]' },
  yellow: { hex: '#F6D365', iconColor: 'text-[#F6D365]' },
  sky: { hex: '#A9D6F5', iconColor: 'text-[#A9D6F5]' },
  mint: { hex: '#B8E6C3', iconColor: 'text-[#B8E6C3]' },
  default: { hex: '#FFFFFF', iconColor: 'text-[#E9A8C9]' },
};

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  variant = 'default',
  className = '',
}: QuickActionCardProps) {
  const conf = variantStyles[variant] || variantStyles.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        href={href}
        style={{ backgroundColor: conf.hex }}
        className={`group flex items-center gap-4 rounded-[24px] p-5 shadow-sm border border-black/5 transition-all duration-300 hover:shadow-md ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#111111] text-white shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
          <Icon className={`h-6 w-6 ${conf.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-sm font-bold text-[#111111]">{title}</h3>
          <p className="font-body mt-0.5 text-xs text-[#111111]/80 font-medium">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-[#111111]/60 transition-all group-hover:translate-x-1 group-hover:text-[#111111]" />
      </Link>
    </motion.div>
  );
}
