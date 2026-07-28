'use client';

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import type { AiConnectionStatus } from '@/hooks/useAIInference';
import type { AiHealthResponse } from '@/lib/ai-inference-api';

export interface ConnectionStatusProps {
  status: AiConnectionStatus;
  health: AiHealthResponse | null;
  onRetry?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  AiConnectionStatus,
  { icon: typeof Wifi; color: string; bg: string; label: string }
> = {
  connected: {
    icon: Wifi,
    color: 'text-success-600 dark:text-success-400',
    bg: 'bg-success-50 border-success-200 dark:bg-success-500/10 dark:border-success-800',
    label: 'AI Service Connected',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-warning-600 dark:text-warning-400',
    bg: 'bg-warning-50 border-warning-200 dark:bg-warning-500/10 dark:border-warning-800',
    label: 'AI Service Degraded',
  },
  offline: {
    icon: WifiOff,
    color: 'text-danger-600 dark:text-danger-400',
    bg: 'bg-danger-50 border-danger-200 dark:bg-danger-500/10 dark:border-danger-800',
    label: 'AI Service Offline',
  },
  unknown: {
    icon: Loader2,
    color: 'text-surface-500 dark:text-surface-400',
    bg: 'bg-surface-50 border-surface-200 dark:bg-surface-800 dark:border-surface-700',
    label: 'Checking AI Service...',
  },
};

export default function ConnectionStatus({
  status,
  health,
  onRetry,
  className = '',
}: ConnectionStatusProps) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-[14px] border px-3 py-2 text-xs font-medium ${cfg.bg} ${className}`}
      data-testid="connection-status"
      role="status"
      aria-label={cfg.label}
    >
      <Icon className={`h-3.5 w-3.5 ${cfg.color} ${status === 'unknown' ? 'animate-spin' : ''}`} />
      <span className={cfg.color}>{cfg.label}</span>

      {health && status !== 'unknown' && (
        <span className="ml-1 text-surface-400">v{health.model_version}</span>
      )}

      {(status === 'offline' || status === 'degraded') && onRetry && (
        <button
          onClick={onRetry}
          className="ml-1 inline-flex items-center gap-1 rounded-[8px] px-1.5 py-0.5 text-xs text-surface-500 hover:bg-white/50 dark:hover:bg-surface-800"
          aria-label="Retry connection"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
