'use client';

import React from 'react';
import { Languages, Clock, Cpu } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';
import type { AiPredictionResult } from '@/lib/ai-inference-api';

export interface TranslationCardProps {
  result: AiPredictionResult | null;
  isLoading?: boolean;
  className?: string;
}

export default function TranslationCard({
  result,
  isLoading = false,
  className = '',
}: TranslationCardProps) {
  const text = result?.prediction?.text ?? '';
  const confidence = result?.confidence ?? 0;
  const processingMs = result?.processing_time_ms ?? 0;
  const modelVersion = result?.model_version ?? '—';

  return (
    <div
      className={`rounded-card border border-surface-200 bg-white shadow-card dark:border-surface-700 dark:bg-surface-900 ${className}`}
      data-testid="translation-card"
    >
      <div className="flex items-center gap-2 border-b border-surface-100 px-5 py-3 dark:border-surface-800">
        <Languages className="h-4 w-4 text-warning-600" />
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Translation</h3>
      </div>

      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-surface-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-warning-300 border-t-warning-600" />
            <span className="text-sm">Translating...</span>
          </div>
        ) : text ? (
          <>
            <p
              className="text-2xl font-bold leading-tight text-surface-900 dark:text-white"
              data-testid="translation-text"
            >
              {text}
            </p>

            <div className="mt-4 space-y-3">
              <ConfidenceMeter value={confidence} />

              <div className="flex items-center gap-4 text-xs text-surface-500">
                <span className="inline-flex items-center gap-1" data-testid="processing-time">
                  <Clock className="h-3 w-3" />
                  {processingMs.toFixed(1)}ms
                </span>
                <span className="inline-flex items-center gap-1" data-testid="model-version">
                  <Cpu className="h-3 w-3" />v{modelVersion}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-surface-400">
            No translation yet. Enable your camera and perform a sign to see results.
          </p>
        )}
      </div>
    </div>
  );
}
