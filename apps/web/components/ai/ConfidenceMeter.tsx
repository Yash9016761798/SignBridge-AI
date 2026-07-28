'use client';

import React from 'react';

export interface ConfidenceMeterProps {
  value: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getColor(value: number): { bar: string; text: string; label: string } {
  if (value >= 0.8)
    return { bar: 'bg-success-500', text: 'text-success-700 dark:text-success-400', label: 'High' };
  if (value >= 0.5)
    return {
      bar: 'bg-warning-500',
      text: 'text-warning-700 dark:text-warning-400',
      label: 'Medium',
    };
  return { bar: 'bg-danger-500', text: 'text-danger-700 dark:text-danger-400', label: 'Low' };
}

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export default function ConfidenceMeter({
  value,
  showPercentage = true,
  size = 'md',
  className = '',
}: ConfidenceMeterProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const pct = Math.round(clamped * 100);
  const color = getColor(clamped);

  return (
    <div className={className} data-testid="confidence-meter">
      <div className="flex items-center justify-between mb-1">
        {showPercentage && (
          <span className={`text-xs font-medium ${color.text}`} data-testid="confidence-value">
            {pct}%
          </span>
        )}
        <span className={`text-xs ${color.text}`}>{color.label}</span>
      </div>
      <div className={`w-full rounded-full bg-surface-100 dark:bg-surface-800 ${HEIGHTS[size]}`}>
        <div
          className={`rounded-full transition-all duration-300 ease-out ${color.bar} ${HEIGHTS[size]}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid="confidence-bar"
        />
      </div>
    </div>
  );
}
