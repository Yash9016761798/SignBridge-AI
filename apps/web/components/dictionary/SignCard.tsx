'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Play } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import type { SignWordListItem } from '@/types/dictionary';

interface SignCardProps {
  sign: SignWordListItem;
  onToggleFavorite?: (signId: string) => void;
}

export default function SignCard({ sign, onToggleFavorite }: SignCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-card border border-surface-200 bg-white shadow-card transition-all hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900">
      <Link href={`/dictionary/${sign.id}`} className="block">
        <div className="aspect-video bg-info-50 dark:bg-info-500/5 flex items-center justify-center relative">
          {sign.videoUrl ? (
            <Play className="h-12 w-12 text-info-500 opacity-60 group-hover:opacity-100 transition-opacity" />
          ) : (
            <span className="text-5xl font-bold text-info-300 dark:text-info-500/30">
              {sign.word.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="absolute top-2 left-2">
            <DifficultyBadge difficulty={sign.difficulty} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-surface-900 group-hover:text-info-600 transition-colors dark:text-white dark:group-hover:text-info-400">
            {sign.word}
          </h3>
          <p className="mt-1 text-sm text-surface-500 line-clamp-2">{sign.meaning}</p>
          {sign.category && <p className="mt-2 text-xs text-surface-400">{sign.category.name}</p>}
        </div>
      </Link>
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(sign.id);
          }}
          className="absolute top-3 right-3 rounded-full p-1.5 bg-white/80 hover:bg-white transition-colors shadow-sm dark:bg-surface-900/80 dark:hover:bg-surface-900"
          aria-label={sign.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              sign.isFavorited ? 'fill-danger-500 text-danger-500' : 'text-surface-400'
            }`}
          />
        </button>
      )}
    </div>
  );
}
