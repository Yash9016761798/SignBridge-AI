'use client';

import React from 'react';
import { Languages, Clock, Cpu, BarChart } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
      className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden ${className}`}
      data-testid="translation-panel"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        <Languages className="h-4 w-4 text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">Live Translation</h3>
        {isNew && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
        )}
      </div>

      {/* Main translation area */}
      <div className="px-5 py-5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
            <span className="text-sm">Processing...</span>
          </div>
        ) : translation ? (
          <p
            className={`text-2xl font-bold leading-tight text-gray-900 transition-all duration-300 ${
              isNew ? 'scale-105 text-primary-700' : ''
            }`}
            data-testid="live-translation-text"
          >
            {translation}
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            Start translation to see live results.
          </p>
        )}
      </div>

      {/* Confidence */}
      {translation && (
        <div className="px-5 pb-4">
          <ConfidenceMeter value={confidence} size="md" />
        </div>
      )}

      {/* Stats bar */}
      {translation && (
        <div className="grid grid-cols-2 border-t border-gray-100 bg-gray-50 px-5 py-3 sm:grid-cols-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span data-testid="live-latency">{latency}ms</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <BarChart className="h-3 w-3" />
            <span data-testid="live-fps">{fps} FPS</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Cpu className="h-3 w-3" />
            <span data-testid="live-model">v{modelVersion}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span data-testid="live-frames">{totalFrames} frames</span>
          </div>
        </div>
      )}

      {/* Session time */}
      {translation && (
        <div className="border-t border-gray-100 px-5 py-2 text-center text-xs text-gray-400">
          Session: {Math.floor(sessionDuration / 60)}m {Math.floor(sessionDuration % 60)}s
        </div>
      )}
    </div>
  );
}
