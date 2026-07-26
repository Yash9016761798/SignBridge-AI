'use client';

import React from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import type { SessionState } from '@/hooks/useRealtimeTranslation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionControlsProps {
  sessionState: SessionState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SessionControls({
  sessionState,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  className = '',
}: SessionControlsProps) {
  const isIdle = sessionState === 'idle' || sessionState === 'stopped';
  const isRunning = sessionState === 'running';
  const isPaused = sessionState === 'paused';

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      data-testid="session-controls"
    >
      {isIdle && (
        <button
          onClick={onStart}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
          data-testid="btn-start"
        >
          <Play className="h-4 w-4" /> Start Translation
        </button>
      )}

      {isRunning && (
        <button
          onClick={onPause}
          className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600 transition-colors"
          data-testid="btn-pause"
        >
          <Pause className="h-4 w-4" /> Pause
        </button>
      )}

      {isPaused && (
        <button
          onClick={onResume}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
          data-testid="btn-resume"
        >
          <Play className="h-4 w-4" /> Resume
        </button>
      )}

      {!isIdle && (
        <>
          <button
            onClick={onStop}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors"
            data-testid="btn-stop"
          >
            <Square className="h-4 w-4" /> Stop
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            data-testid="btn-reset"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </>
      )}

      {isIdle && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          data-testid="btn-reset"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      )}

      <span
        className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isRunning
            ? 'bg-green-100 text-green-700'
            : isPaused
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-500'
        }`}
        data-testid="session-state"
      >
        {sessionState === 'idle' && 'Ready'}
        {sessionState === 'running' && 'Running'}
        {sessionState === 'paused' && 'Paused'}
        {sessionState === 'stopped' && 'Stopped'}
      </span>
    </div>
  );
}
