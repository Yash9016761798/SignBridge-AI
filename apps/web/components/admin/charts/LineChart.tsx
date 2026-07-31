'use client';

import React from 'react';
import type { ChartDataPoint } from '@/types/admin-analytics';

interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  showLabels?: boolean;
}

export default function LineChart({ data, height = 160, color = 'stroke-primary-500', fillColor = 'fill-primary-500/10', showDots = true, showLabels = true }: LineChartProps) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 20, right: 10, bottom: showLabels ? 24 : 8, left: 10 };

  const w = 400;
  const h = height;
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - (d.value / max) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const labelStep = Math.ceil(data.length / 7);

  return (
    <div className="w-full" style={{ height: h }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
        <path d={areaD} className={fillColor} />
        <path d={pathD} fill="none" className={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {showDots && points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-white stroke-primary-500" strokeWidth="2" />
        ))}
        {showLabels && points.map((p, i) => (
          i % labelStep === 0 ? (
            <text key={i} x={p.x} y={h - 4} textAnchor="middle" className="fill-surface-400" fontSize="10">
              {data[i].label}
            </text>
          ) : null
        ))}
      </svg>
    </div>
  );
}
