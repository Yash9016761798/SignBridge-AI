'use client';

import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PredictionEntry {
  text: string;
  confidence: number;
  timestamp: number;
}

export interface UsePredictionSmoothingOptions {
  /** Number of recent predictions to consider. Default 5. */
  windowSize?: number;
  /** Minimum confidence to accept a prediction. Default 0.70. */
  confidenceThreshold?: number;
  /** Minimum votes (as fraction of window) for a text to be accepted. Default 0.5. */
  agreementThreshold?: number;
}

export interface UsePredictionSmoothingReturn {
  /** The current smoothed (stable) prediction text. */
  stablePrediction: string;
  /** Confidence of the stable prediction. */
  stableConfidence: number;
  /** Raw incoming prediction (before smoothing). */
  rawPrediction: string;
  /** Whether a new stable prediction was just emitted. */
  isNew: boolean;
  /** Feed a raw prediction into the smoother. Returns the stable text or empty. */
  feedPrediction: (text: string, confidence: number) => string;
  /** Clear all internal state. */
  clear: () => void;
  /** Current sliding window of recent predictions. */
  recentPredictions: PredictionEntry[];
}

/**
 * Temporal prediction smoothing using majority vote with confidence weighting.
 *
 * Keeps the last N predictions. Only emits a new "stable" prediction when
 * enough recent predictions agree (majority vote) and meet the confidence
 * threshold. Prevents flickering between rapidly changing predictions.
 *
 * Usage:
 * ```tsx
 * const { stablePrediction, feedPrediction } = usePredictionSmoothing();
 * ```
 */
export function usePredictionSmoothing(
  options: UsePredictionSmoothingOptions = {},
): UsePredictionSmoothingReturn {
  const {
    windowSize = 5,
    confidenceThreshold = 0.70,
    agreementThreshold = 0.5,
  } = options;

  const windowRef = useRef<PredictionEntry[]>([]);
  const [stablePrediction, setStablePrediction] = useState('');
  const [stableConfidence, setStableConfidence] = useState(0);
  const [rawPrediction, setRawPrediction] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [recentPredictions, setRecentPredictions] = useState<PredictionEntry[]>([]);

  const feedPrediction = useCallback(
    (text: string, confidence: number): string => {
      setRawPrediction(text);
      setIsNew(false);

      if (!text || text.trim() === '') return stablePrediction;
      if (confidence < confidenceThreshold) return stablePrediction;

      const entry: PredictionEntry = {
        text: text.trim(),
        confidence,
        timestamp: Date.now(),
      };

      const win = windowRef.current;
      win.push(entry);
      if (win.length > windowSize) {
        win.shift();
      }
      setRecentPredictions([...win]);

      const votes = new Map<string, { count: number; totalConf: number }>();
      for (const e of win) {
        const existing = votes.get(e.text) || { count: 0, totalConf: 0 };
        votes.set(e.text, {
          count: existing.count + 1,
          totalConf: existing.totalConf + e.confidence,
        });
      }

      let bestText = '';
      let bestCount = 0;
      let bestAvgConf = 0;

      for (const [text, { count, totalConf }] of votes) {
        if (count > bestCount || (count === bestCount && totalConf > bestAvgConf)) {
          bestText = text;
          bestCount = count;
          bestAvgConf = totalConf;
        }
      }

      const agreement = bestCount / win.length;
      if (agreement >= agreementThreshold) {
        const avgConf = bestAvgConf / bestCount;
        if (bestText !== stablePrediction) {
          setStablePrediction(bestText);
          setStableConfidence(avgConf);
          setIsNew(true);
          return bestText;
        }
        setStableConfidence(avgConf);
      }

      return stablePrediction;
    },
    [windowSize, confidenceThreshold, agreementThreshold, stablePrediction],
  );

  const clear = useCallback(() => {
    windowRef.current = [];
    setStablePrediction('');
    setStableConfidence(0);
    setRawPrediction('');
    setIsNew(false);
    setRecentPredictions([]);
  }, []);

  return {
    stablePrediction,
    stableConfidence,
    rawPrediction,
    isNew,
    feedPrediction,
    clear,
    recentPredictions,
  };
}

export default usePredictionSmoothing;
