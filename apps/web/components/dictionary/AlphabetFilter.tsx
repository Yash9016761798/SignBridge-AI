'use client';

import React from 'react';

interface AlphabetFilterProps {
  selectedLetter: string;
  onLetterSelect: (letter: string) => void;
  stats?: Record<string, number>;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AlphabetFilter({
  selectedLetter,
  onLetterSelect,
  stats = {},
}: AlphabetFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onLetterSelect('')}
        className={`h-9 min-w-[36px] rounded-[10px] px-2 text-sm font-medium transition-colors ${
          selectedLetter === ''
            ? 'bg-info-500 text-surface-900'
            : 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
        }`}
      >
        All
      </button>
      {ALPHABET.map((letter) => {
        const count = stats[letter] || 0;
        return (
          <button
            key={letter}
            onClick={() => onLetterSelect(selectedLetter === letter ? '' : letter)}
            className={`relative h-9 min-w-[36px] rounded-[10px] px-2 text-sm font-medium transition-colors ${
              selectedLetter === letter
                ? 'bg-info-500 text-surface-900'
                : count > 0
                  ? 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
                  : 'bg-surface-50 text-surface-300 cursor-not-allowed dark:bg-surface-800/50 dark:text-surface-600'
            }`}
            disabled={count === 0}
            title={
              count > 0
                ? `${count} signs starting with ${letter}`
                : `No signs starting with ${letter}`
            }
          >
            {letter}
            {count > 0 && (
              <span
                className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  selectedLetter === letter
                    ? 'bg-white text-info-600'
                    : 'bg-info-100 text-info-600 dark:bg-info-500/15 dark:text-info-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
