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
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prediction</h3>
          {targetGesture && (
            <p className="text-sm text-gray-500">Target: {targetGesture}</p>
          )}
        </div>
        {isCorrect !== null && (
          isCorrect
            ? <CheckCircle className="h-6 w-6 text-green-500" />
            : <XCircle className="h-6 w-6 text-red-500" />
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{result.gesture}</span>
          <span className="text-sm text-gray-500">
            {Math.round(result.confidence * 100)}%
          </span>
        </div>

        <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all ${
              result.confidence >= 0.8 ? 'bg-green-500' : result.confidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      {result.alternatives.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Alternatives</p>
          <div className="space-y-1">
            {result.alternatives.map((alt, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{alt.gesture}</span>
                <span className="text-gray-400">{Math.round(alt.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {result.processingTimeMs}ms
        </span>
        <span>v{result.modelVersion}</span>
      </div>
    </div>
  );
}
