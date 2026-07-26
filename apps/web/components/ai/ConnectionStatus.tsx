'use client';

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import type { AiConnectionStatus } from '@/hooks/useAIInference';
import type { AiHealthResponse } from '@/lib/ai-inference-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConnectionStatusProps {
  /** Derived connection status. */
  status: AiConnectionStatus;
  /** Raw health response. */
  health: AiHealthResponse | null;
  /** Called when the user clicks retry. */
  onRetry?: () => void;
  /** Additional CSS classes. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  AiConnectionStatus,
  { icon: typeof Wifi; color: string; bg: string; label: string }
> = {
  connected: {
    icon: Wifi,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    label: 'AI Service Connected',
  },
  degraded: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    label: 'AI Service Degraded',
  },
  offline: {
    icon: WifiOff,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    label: 'AI Service Offline',
  },
  unknown: {
    icon: Loader2,
    color: 'text-gray-500',
    bg: 'bg-gray-50 border-gray-200',
    label: 'Checking AI Service...',
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${cfg.bg} ${className}`}
      data-testid="connection-status"
      role="status"
      aria-label={cfg.label}
    >
      <Icon className={`h-3.5 w-3.5 ${cfg.color} ${status === 'unknown' ? 'animate-spin' : ''}`} />
      <span className={cfg.color}>{cfg.label}</span>

      {health && status !== 'unknown' && (
        <span className="ml-1 text-gray-400">
          v{health.model_version}
        </span>
      )}

      {(status === 'offline' || status === 'degraded') && onRetry && (
        <button
          onClick={onRetry}
          className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-white/50"
          aria-label="Retry connection"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
