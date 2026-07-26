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

export default function CategoryBrowser({ categories, selectedCategoryId, onCategorySelect, loading }: CategoryBrowserProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-32 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <button
        onClick={() => onCategorySelect('')}
        className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          selectedCategoryId === ''
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <BookMarked className="h-4 w-4" />
        All Categories
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategorySelect(selectedCategoryId === cat.id ? '' : cat.id)}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
            selectedCategoryId === cat.id
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{cat.icon || '📂'}</span>
          <span>{cat.name}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-xs ${
            selectedCategoryId === cat.id ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
          }`}>
            {cat.signCount}
          </span>
        </button>
      ))}
    </div>
  );
}
