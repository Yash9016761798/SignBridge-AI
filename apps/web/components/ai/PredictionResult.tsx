'use client';

import React from 'react';
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import type { PredictionResult as PredictionResultType } from '@/types/ai';

interface PredictionResultProps {
  result: PredictionResultType;
  targetGesture?: string;
}

export default function PredictionResultDisplay({ result, targetGesture }: PredictionResultProps) {
  const isCorrect = targetGesture
    ? result.gesture.toLowerCase() === targetGesture.toLowerCase()
    : null;

  return (
    <div className="rounded-card border border-surface-200 bg-white p-6 dark:border-surface-700 dark:bg-surface-900">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Prediction</h3>
          {targetGesture && <p className="text-sm text-surface-500">Target: {targetGesture}</p>}
        </div>
        {isCorrect !== null &&
          (isCorrect ? (
            <CheckCircle className="h-6 w-6 text-success-500" />
          ) : (
            <XCircle className="h-6 w-6 text-danger-500" />
          ))}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-surface-900 dark:text-white">
            {result.gesture}
          </span>
          <span className="text-sm text-surface-500">{Math.round(result.confidence * 100)}%</span>
        </div>

        <div className="mt-3 h-2 w-full rounded-full bg-surface-100 dark:bg-surface-800">
          <div
            className={`h-2 rounded-full transition-all ${
              result.confidence >= 0.8
                ? 'bg-success-500'
                : result.confidence >= 0.5
                  ? 'bg-warning-500'
                  : 'bg-danger-500'
            }`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {result.alternatives.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-surface-500 mb-2">Alternatives</p>
          <div className="space-y-1">
            {result.alternatives.map((alt, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">{alt.gesture}</span>
                <span className="text-surface-400">{Math.round(alt.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-surface-400">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {result.processingTimeMs}ms
        </span>
        <span>v{result.modelVersion}</span>
      </div>
    </div>
  );
}
