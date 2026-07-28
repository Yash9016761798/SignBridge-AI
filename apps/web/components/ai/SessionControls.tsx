'use client';

import React from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import type { SessionState } from '@/hooks/useRealtimeTranslation';

export interface SessionControlsProps {
  sessionState: SessionState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string;
}

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
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-success-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-700 transition-colors"
          data-testid="btn-start"
        >
          <Play className="h-4 w-4" /> Start Translation
        </button>
      )}

      {isRunning && (
        <button
          onClick={onPause}
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-warning-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-warning-600 transition-colors"
          data-testid="btn-pause"
        >
          <Pause className="h-4 w-4" /> Pause
        </button>
      )}

      {isPaused && (
        <button
          onClick={onResume}
          className="inline-flex items-center gap-1.5 rounded-[14px] bg-success-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-700 transition-colors"
          data-testid="btn-resume"
        >
          <Play className="h-4 w-4" /> Resume
        </button>
      )}

      {!isIdle && (
        <>
          <button
            onClick={onStop}
            className="inline-flex items-center gap-1.5 rounded-[14px] bg-danger-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-danger-700 transition-colors"
            data-testid="btn-stop"
          >
            <Square className="h-4 w-4" /> Stop
          </button>
          <button
            onClick={onReset}
            className="btn-secondary inline-flex items-center gap-1.5 text-sm"
            data-testid="btn-reset"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </>
      )}

      {isIdle && (
        <button
          onClick={onReset}
          className="btn-secondary inline-flex items-center gap-1.5 text-sm"
          data-testid="btn-reset"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      )}

      <span
        className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isRunning
            ? 'bg-success-100 text-success-700 dark:bg-success-500/10 dark:text-success-400'
            : isPaused
              ? 'bg-warning-100 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400'
              : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'
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
