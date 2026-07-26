'use client';

import React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConfidenceMeterProps {
  /** Confidence value between 0 and 1. */
  value: number;
  /** Show the numeric percentage. Default true. */
  showPercentage?: boolean;
  /** Size variant. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getColor(value: number): { bar: string; text: string; label: string } {
  if (value >= 0.8) return { bar: 'bg-green-500', text: 'text-green-700', label: 'High' };
  if (value >= 0.5) return { bar: 'bg-yellow-500', text: 'text-yellow-700', label: 'Medium' };
  return { bar: 'bg-red-500', text: 'text-red-700', label: 'Low' };
}

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
      <div className={`w-full rounded-full bg-gray-100 ${HEIGHTS[size]}`}>
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
