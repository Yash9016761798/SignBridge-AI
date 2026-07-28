'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: 'light' | 'dark'; icon: React.ElementType; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
  ];

  return (
    <div
      className="flex items-center gap-0.5 rounded-[14px] border border-surface-200 bg-surface-50 p-1 dark:border-surface-700 dark:bg-surface-800"
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`relative min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[10px] px-2.5 py-1.5 text-xs font-medium transition-colors ${
            theme === opt.value
              ? 'text-surface-900 dark:text-white'
              : 'text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300'
          }`}
          role="radio"
          aria-checked={theme === opt.value}
          aria-label={`${opt.label} mode`}
        >
          {theme === opt.value && (
            <motion.div
              layoutId="theme-toggle"
              className="absolute inset-0 rounded-[10px] bg-white shadow-sm dark:bg-surface-700"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
          <opt.icon className="relative z-10 h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
