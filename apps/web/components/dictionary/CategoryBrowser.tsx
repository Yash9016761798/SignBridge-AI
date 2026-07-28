'use client';

import React from 'react';
import { BookMarked } from 'lucide-react';
import type { SignCategory } from '@/types/dictionary';

interface CategoryBrowserProps {
  categories: SignCategory[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string) => void;
  loading?: boolean;
}

export default function CategoryBrowser({
  categories,
  selectedCategoryId,
  onCategorySelect,
  loading,
}: CategoryBrowserProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-32 animate-pulse rounded-[12px] bg-surface-100 dark:bg-surface-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => onCategorySelect('')}
        className={`flex shrink-0 items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-medium transition-colors ${
          selectedCategoryId === ''
            ? 'bg-info-500 text-surface-900'
            : 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
        }`}
      >
        <BookMarked className="h-4 w-4" />
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategorySelect(selectedCategoryId === cat.id ? '' : cat.id)}
          className={`flex shrink-0 items-center gap-2 rounded-[12px] px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            selectedCategoryId === cat.id
              ? 'bg-info-500 text-surface-900'
              : 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
          }`}
        >
          <span>{cat.icon || '📂'}</span>
          <span>{cat.name}</span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-xs ${
              selectedCategoryId === cat.id
                ? 'bg-white/30'
                : 'bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
            }`}
          >
            {cat.signCount}
          </span>
        </button>
      ))}
    </div>
  );
}
