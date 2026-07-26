'use client';

import React from 'react';

interface AlphabetFilterProps {
  selectedLetter: string;
  onLetterSelect: (letter: string) => void;
  stats?: Record<string, number>;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AlphabetFilter({ selectedLetter, onLetterSelect, stats = {} }: AlphabetFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onLetterSelect('')}
        className={`h-9 min-w-[36px] rounded-lg px-2 text-sm font-medium transition-colors ${
          selectedLetter === ''
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            className={`relative h-9 min-w-[36px] rounded-lg px-2 text-sm font-medium transition-colors ${
              selectedLetter === letter
                ? 'bg-primary-600 text-white'
                : count > 0
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
            disabled={count === 0}
            title={count > 0 ? `${count} signs starting with ${letter}` : `No signs starting with ${letter}`}
          >
            {letter}
            {count > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                selectedLetter === letter ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-700'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
