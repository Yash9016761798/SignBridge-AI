'use client';

import type { SignDifficulty } from '@/types/dictionary';

const difficultyConfig: Record<SignDifficulty, { label: string; className: string }> = {
  BEGINNER: { label: 'Beginner', className: 'bg-green-100 text-green-800' },
  INTERMEDIATE: { label: 'Intermediate', className: 'bg-yellow-100 text-yellow-800' },
  ADVANCED: { label: 'Advanced', className: 'bg-red-100 text-red-800' },
};

interface DifficultyBadgeProps {
  difficulty: SignDifficulty;
  className?: string;
}

export default function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
