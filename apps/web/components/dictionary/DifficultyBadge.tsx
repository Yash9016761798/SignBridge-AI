'use client';

import type { SignDifficulty } from '@/types/dictionary';

const difficultyConfig: Record<SignDifficulty, { label: string; className: string }> = {
  BEGINNER: {
    label: 'Beginner',
    className: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    className: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-600',
  },
  ADVANCED: {
    label: 'Advanced',
    className: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
  },
};

interface DifficultyBadgeProps {
  difficulty: SignDifficulty;
  className?: string;
}

export default function DifficultyBadge({ difficulty, className = '' }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
