'use client';

import React from 'react';
import type { ChartDataPoint } from '@/types/admin-analytics';

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  showValues?: boolean;
  showLabels?: boolean;
}

export default function BarChart({ data, height = 160, color = 'bg-primary-500', showValues = true, showLabels = true }: BarChartProps) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full items-end gap-1.5">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1 min-w-0">
              {showValues && <span className="text-2xs font-medium text-surface-500">{d.value > 999 ? `${(d.value / 1000).toFixed(1)}k` : d.value}</span>}
              <div className="w-full rounded-t-md transition-all duration-300 hover:opacity-80" style={{ height: `${pct}%` }}>
                <div className={`h-full w-full rounded-t-md ${color}`} />
              </div>
              {showLabels && <span className="text-2xs text-surface-400 truncate w-full text-center">{d.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
