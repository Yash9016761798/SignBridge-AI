'use client';

import React from 'react';
import { Camera, Cpu, Wifi, WifiOff, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import type { AiConnectionStatus } from '@/hooks/useAIInference';
import type { AiHealthResponse } from '@/lib/ai-inference-api';
import type { CameraStatus } from '@/hooks/useCamera';
import type { SessionState } from '@/hooks/useRealtimeTranslation';

export interface ConnectionMonitorProps {
  cameraStatus: CameraStatus;
  aiStatus: AiConnectionStatus;
  sessionState: SessionState;
  aiHealth: AiHealthResponse | null;
  onRetryAi?: () => void;
  className?: string;
}

function Indicator({
  icon: Icon,
  label,
  status,
  color,
  version,
}: {
  icon: typeof Camera;
  label: string;
  status: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
  version?: string;
}) {
  const colors = {
    green:
      'bg-success-50 border-success-200 text-success-700 dark:bg-success-500/10 dark:border-success-800 dark:text-success-400',
    yellow:
      'bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-500/10 dark:border-warning-800 dark:text-warning-400',
    red: 'bg-danger-50 border-danger-200 text-danger-700 dark:bg-danger-500/10 dark:border-danger-800 dark:text-danger-400',
    gray: 'bg-surface-50 border-surface-200 text-surface-500 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-400',
  };

  const iconColors = {
    green: 'text-success-500',
    yellow: 'text-warning-500',
    red: 'text-danger-500',
    gray: 'text-surface-400',
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-[14px] border px-3 py-2 text-xs font-medium ${colors[color]}`}
      data-testid={`indicator-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <Icon className={`h-3.5 w-3.5 ${iconColors[color]}`} />
      <span>{label}</span>
      <span className="text-[10px] opacity-70">{status}</span>
      {version && <span className="ml-auto opacity-50">{version}</span>}
    </div>
  );
}

export default function ConnectionMonitor({
  cameraStatus,
  aiStatus,
  sessionState,
  aiHealth,
  onRetryAi,
  className = '',
}: ConnectionMonitorProps) {
  const cameraColor =
    cameraStatus === 'active'
      ? 'green'
      : cameraStatus === 'requesting'
        ? 'yellow'
        : cameraStatus === 'idle'
          ? 'gray'
          : 'red';

  const cameraStatusText =
    cameraStatus === 'active'
      ? 'Active'
      : cameraStatus === 'requesting'
        ? 'Starting...'
        : cameraStatus === 'denied'
          ? 'Denied'
          : cameraStatus === 'error'
            ? 'Error'
            : 'Off';

  const aiColor =
    aiStatus === 'connected'
      ? 'green'
      : aiStatus === 'degraded'
        ? 'yellow'
        : aiStatus === 'offline'
          ? 'red'
          : 'gray';

  const aiStatusText =
    aiStatus === 'connected'
      ? 'Connected'
      : aiStatus === 'degraded'
        ? 'Degraded'
        : aiStatus === 'offline'
          ? 'Offline'
          : 'Checking...';

  const sessionColor =
    sessionState === 'running' ? 'green' : sessionState === 'paused' ? 'yellow' : 'gray';

  const sessionStatusText =
    sessionState === 'running'
      ? 'Active'
      : sessionState === 'paused'
        ? 'Paused'
        : sessionState === 'stopped'
          ? 'Stopped'
          : 'Idle';

  return (
    <div
      className={`rounded-card border border-surface-200 bg-white shadow-card dark:border-surface-700 dark:bg-surface-900 ${className}`}
      data-testid="connection-monitor"
    >
      <div className="flex items-center justify-between border-b border-surface-100 px-5 py-3 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Connections</h3>
        {onRetryAi && (aiStatus === 'offline' || aiStatus === 'degraded') && (
          <button
            onClick={onRetryAi}
            className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-xs text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
            data-testid="btn-retry-ai"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        )}
      </div>

      <div className="space-y-2 px-5 py-4">
        <Indicator icon={Camera} label="Camera" status={cameraStatusText} color={cameraColor} />
        <Indicator
          icon={aiStatus === 'offline' ? WifiOff : Wifi}
          label="AI Service"
          status={aiStatusText}
          color={aiColor}
          version={aiHealth?.model_version}
        />
        <Indicator
          icon={Cpu}
          label="Model"
          status={aiHealth?.model_loaded ? 'Loaded' : 'Not Loaded'}
          color={aiHealth?.model_loaded ? 'green' : 'yellow'}
        />
        <Indicator
          icon={sessionState === 'running' ? Loader2 : AlertTriangle}
          label="Session"
          status={sessionStatusText}
          color={sessionColor}
        />
      </div>
    </div>
  );
}
