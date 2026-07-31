'use client';

import React from 'react';
import type { BreakdownItem } from '@/types/admin-analytics';

interface DonutChartProps {
  data: BreakdownItem[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export default function DonutChart({ data, size = 160, thickness = 24, centerLabel, centerValue }: DonutChartProps) {
  if (!data.length) return null;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;

  let offset = 0;

  const COLOR_MAP: Record<string, string> = {
    'bg-primary-500': '#E9A8C9',
    'bg-info-500': '#A9D6F5',
    'bg-success-500': '#B8E6C3',
    'bg-warning-500': '#F7C873',
    'bg-danger-500': '#F87171',
    'bg-secondary-500': '#F6D365',
    'bg-surface-400': '#A0A0A0',
    'bg-sky-400': '#7DD3FC',
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={COLOR_MAP[d.color] || '#A0A0A0'}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerValue !== undefined && <span className="text-lg font-bold text-surface-900 dark:text-white">{centerValue}</span>}
        {centerLabel && <span className="text-2xs text-surface-500">{centerLabel}</span>}
      </div>
    </div>
  );
}
