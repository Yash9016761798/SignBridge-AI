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
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/dictionary/${sign.id}`} className="block">
        <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative">
          {sign.videoUrl ? (
            <Play className="h-12 w-12 text-primary-600 opacity-60 group-hover:opacity-100 transition-opacity" />
          ) : (
            <span className="text-5xl font-bold text-primary-300">
              {sign.word.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="absolute top-2 left-2">
            <DifficultyBadge difficulty={sign.difficulty} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {sign.word}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{sign.meaning}</p>
          {sign.category && (
            <p className="mt-2 text-xs text-gray-400">{sign.category.name}</p>
          )}
        </div>
      </Link>
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(sign.id);
          }}
          className="absolute top-3 right-3 rounded-full p-1.5 bg-white/80 hover:bg-white transition-colors shadow-sm"
          aria-label={sign.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              sign.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      )}
    </div>
  );
}
