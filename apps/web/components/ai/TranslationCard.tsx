'use client';

import React from 'react';
import { Languages, Clock, Cpu } from 'lucide-react';
import ConfidenceMeter from './ConfidenceMeter';
import type { AiPredictionResult } from '@/lib/ai-inference-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TranslationCardProps {
  /** The prediction result to display. */
  result: AiPredictionResult | null;
  /** Whether the inference is in progress. */
  isLoading?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
      data-testid="translation-card"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
        <Languages className="h-4 w-4 text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">Translation</h3>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
            <span className="text-sm">Translating...</span>
          </div>
        ) : text ? (
          <>
            <p className="text-2xl font-bold leading-tight text-gray-900" data-testid="translation-text">
              {text}
            </p>

            <div className="mt-4 space-y-3">
              <ConfidenceMeter value={confidence} />

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1" data-testid="processing-time">
                  <Clock className="h-3 w-3" />
                  {processingMs.toFixed(1)}ms
                </span>
                <span className="inline-flex items-center gap-1" data-testid="model-version">
                  <Cpu className="h-3 w-3" />
                  v{modelVersion}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400">
            No translation yet. Enable your camera and perform a sign to see results.
          </p>
        )}
      </div>
    </div>
  );
}
