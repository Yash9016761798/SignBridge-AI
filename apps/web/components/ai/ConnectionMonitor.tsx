'use client';

import React from 'react';
import {
  Camera,
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { AiConnectionStatus } from '@/hooks/useAIInference';
import type { AiHealthResponse } from '@/lib/ai-inference-api';
import type { CameraStatus } from '@/hooks/useCamera';
import type { SessionState } from '@/hooks/useRealtimeTranslation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConnectionMonitorProps {
  cameraStatus: CameraStatus;
  aiStatus: AiConnectionStatus;
  sessionState: SessionState;
  aiHealth: AiHealthResponse | null;
  onRetryAi?: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Indicator
// ---------------------------------------------------------------------------

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
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-500',
  };

  const iconColors = {
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    gray: 'text-gray-400',
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${colors[color]}`}
      data-testid={`indicator-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <Icon className={`h-3.5 w-3.5 ${iconColors[color]}`} />
      <span>{label}</span>
      <span className="text-[10px] opacity-70">{status}</span>
      {version && <span className="ml-auto opacity-50">{version}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
    sessionState === 'running'
      ? 'green'
      : sessionState === 'paused'
      ? 'yellow'
      : 'gray';

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
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
      data-testid="connection-monitor"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Connections</h3>
        {onRetryAi && (aiStatus === 'offline' || aiStatus === 'degraded') && (
          <button
            onClick={onRetryAi}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
            data-testid="btn-retry-ai"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        )}
      </div>

      <div className="space-y-2 px-5 py-4">
        <Indicator
          icon={Camera}
          label="Camera"
          status={cameraStatusText}
          color={cameraColor}
        />
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
