'use client';

import React from 'react';
import { Activity, Camera, Cpu, Clock, BarChart3, Zap } from 'lucide-react';
import type { PerformanceMetrics } from '@/hooks/usePerformanceMetrics';

export interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  className?: string;
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] bg-surface-50 px-3 py-2 dark:bg-surface-800">
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-surface-400">{label}</p>
        <p
          className="text-sm font-semibold text-surface-900 dark:text-white"
          data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function PerformanceDashboard({
  metrics,
  className = '',
}: PerformanceDashboardProps) {
  return (
    <div
      className={`rounded-card border border-surface-200 bg-white shadow-card dark:border-surface-700 dark:bg-surface-900 ${className}`}
      data-testid="performance-dashboard"
    >
      <div className="flex items-center gap-2 border-b border-surface-100 px-5 py-3 dark:border-surface-800">
        <BarChart3 className="h-4 w-4 text-surface-500" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Performance</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 py-4 sm:grid-cols-3">
        <Stat icon={Camera} label="Camera FPS" value={metrics.cameraFps} color="text-info-500" />
        <Stat
          icon={Cpu}
          label="Inference FPS"
          value={metrics.inferenceFps}
          color="text-purple-500"
        />
        <Stat
          icon={Clock}
          label="Avg Latency"
          value={`${metrics.avgLatency}ms`}
          color="text-warning-500"
        />
        <Stat
          icon={Zap}
          label="Avg Confidence"
          value={`${Math.round(metrics.avgConfidence * 100)}%`}
          color="text-success-500"
        />
        <Stat
          icon={Activity}
          label="Dropped"
          value={metrics.droppedFrames}
          color="text-danger-500"
        />
        <Stat
          icon={Activity}
          label="Total Frames"
          value={metrics.totalFrames}
          color="text-surface-500"
        />
      </div>

      <div className="border-t border-surface-100 px-5 py-2 dark:border-surface-800">
        <div className="flex items-center justify-between text-xs text-surface-500">
          <span>Inferences: {metrics.totalInferences}</span>
          <span>Accepted: {metrics.acceptedPredictions}</span>
          <span>Session: {metrics.sessionDuration}s</span>
        </div>
      </div>
    </div>
  );
}
