'use client';

import React from 'react';
import { History, Trash2 } from 'lucide-react';
import type { AiPredictionResult } from '@/lib/ai-inference-api';
import ConfidenceMeter from './ConfidenceMeter';

export interface PredictionHistoryItem {
  id: string;
  result: AiPredictionResult;
  timestamp: number;
}

export interface PredictionHistoryProps {
  items: PredictionHistoryItem[];
  onClear?: () => void;
  maxItems?: number;
  className?: string;
}

export default function PredictionHistory({
  items,
  onClear,
  maxItems = 20,
  className = '',
}: PredictionHistoryProps) {
  const visible = items.slice(0, maxItems);

  return (
    <div
      className={`rounded-card border border-surface-200 bg-white shadow-card dark:border-surface-700 dark:bg-surface-900 ${className}`}
      data-testid="prediction-history"
    >
      <div className="flex items-center justify-between border-b border-surface-100 px-5 py-3 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-surface-500" />
          <h3 className="text-sm font-semibold text-surface-900 dark:text-white">History</h3>
          <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-500 dark:bg-surface-800">
            {items.length}
          </span>
        </div>
        {items.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-xs text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300"
            aria-label="Clear history"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-surface-400">No predictions yet.</div>
        ) : (
          <ul className="divide-y divide-surface-50 dark:divide-surface-800">
            {visible.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-surface-900 dark:text-white">
                    {item.result.prediction.text || '—'}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-surface-400">
                    <span>{Math.round(item.result.confidence * 100)}%</span>
                    <span>{item.result.processing_time_ms.toFixed(0)}ms</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <ConfidenceMeter
                    value={item.result.confidence}
                    size="sm"
                    className="mt-1.5"
                    showPercentage={false}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
