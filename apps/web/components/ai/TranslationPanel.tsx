'use client';

import React from 'react';
import { Languages, Clock, Cpu, BarChart } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';

export interface TranslationPanelProps {
  translation: string;
  confidence: number;
  latency: number;
  isNew: boolean;
  fps: number;
  totalFrames: number;
  sessionDuration: number;
  modelVersion?: string;
  isLoading?: boolean;
  className?: string;
}

export default function TranslationPanel({
  translation,
  confidence,
  latency,
  isNew,
  fps,
  totalFrames,
  sessionDuration,
  modelVersion = '—',
  isLoading = false,
  className = '',
}: TranslationPanelProps) {
  return (
    <div
      className={`rounded-card border border-surface-200 bg-white shadow-card overflow-hidden dark:border-surface-700 dark:bg-surface-900 ${className}`}
      data-testid="translation-panel"
    >
      <div className="flex items-center gap-2 border-b border-surface-100 px-5 py-3 dark:border-surface-800">
        <Languages className="h-4 w-4 text-warning-600" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Live Translation</h3>
        {isNew && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
          </span>
        )}
      </div>

      <div className="px-5 py-5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-surface-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-warning-300 border-t-warning-600" />
            <span className="text-sm">Processing...</span>
          </div>
        ) : translation ? (
          <p
            className={`text-2xl font-bold leading-tight text-surface-900 transition-all duration-300 dark:text-white ${
              isNew ? 'scale-105 text-warning-700 dark:text-warning-400' : ''
            }`}
            data-testid="live-translation-text"
          >
            {translation}
          </p>
        ) : (
          <p className="text-sm text-surface-400">Start translation to see live results.</p>
        )}
      </div>

      {translation && (
        <div className="px-5 pb-4">
          <ConfidenceMeter value={confidence} size="md" />
        </div>
      )}

      {translation && (
        <div className="grid grid-cols-2 border-t border-surface-100 bg-surface-50 px-5 py-3 sm:grid-cols-4 dark:border-surface-800 dark:bg-surface-800">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Clock className="h-3 w-3" />
            <span data-testid="live-latency">{latency}ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <BarChart className="h-3 w-3" />
            <span data-testid="live-fps">{fps} FPS</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Cpu className="h-3 w-3" />
            <span data-testid="live-model">v{modelVersion}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <span data-testid="live-frames">{totalFrames} frames</span>
          </div>
        </div>
      )}

      {translation && (
        <div className="border-t border-surface-100 px-5 py-2 text-center text-xs text-surface-400 dark:border-surface-800">
          Session: {Math.floor(sessionDuration / 60)}m {Math.floor(sessionDuration % 60)}s
        </div>
      )}
    </div>
  );
}
