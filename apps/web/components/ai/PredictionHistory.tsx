'use client';

import React from 'react';
import { History, Trash2 } from 'lucide-react';
import type { AiPredictionResult } from '@/lib/ai-inference-api';
import ConfidenceMeter from './ConfidenceMeter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PredictionHistoryItem {
  id: string;
  result: AiPredictionResult;
  timestamp: number;
}

export interface PredictionHistoryProps {
  /** List of past predictions. */
  items: PredictionHistoryItem[];
  /** Called when the user wants to clear history. */
  onClear?: () => void;
  /** Maximum items to display. Default 20. */
  maxItems?: number;
  /** Additional CSS classes. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PredictionHistory({
  items,
  onClear,
  maxItems = 20,
  className = '',
}: PredictionHistoryProps) {
  const visible = items.slice(0, maxItems);

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
      data-testid="prediction-history"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">History</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {items.length}
          </span>
        </div>
        {items.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            aria-label="Clear history"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No predictions yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {visible.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.result.prediction.text || '—'}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span>{Math.round(item.result.confidence * 100)}%</span>
                    <span>{item.result.processing_time_ms.toFixed(0)}ms</span>
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
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
