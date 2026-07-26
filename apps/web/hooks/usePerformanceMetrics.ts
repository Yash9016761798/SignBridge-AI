'use client';

import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PerformanceMetrics {
  /** Camera capture FPS (frames per second). */
  cameraFps: number;
  /** Inference FPS (inference completions per second). */
  inferenceFps: number;
  /** Average inference latency in ms. */
  avgLatency: number;
  /** Average confidence of accepted predictions. */
  avgConfidence: number;
  /** Number of frames dropped (skipped because buffer was full or inference busy). */
  droppedFrames: number;
  /** Total frames captured since session start. */
  totalFrames: number;
  /** Total inference requests sent. */
  totalInferences: number;
  /** Total accepted predictions (above confidence threshold). */
  acceptedPredictions: number;
  /** Session duration in seconds. */
  sessionDuration: number;
}

export interface UsePerformanceMetricsReturn {
  metrics: PerformanceMetrics;
  /** Call when a frame is captured from the camera. */
  recordFrame: () => void;
  /** Call when an inference completes. */
  recordInference: (latencyMs: number, confidence: number, accepted: boolean) => void;
  /** Call when a frame is dropped. */
  recordDrop: () => void;
  /** Reset all metrics. */
  reset: () => void;
}

const INITIAL_METRICS: PerformanceMetrics = {
  cameraFps: 0,
  inferenceFps: 0,
  avgLatency: 0,
  avgConfidence: 0,
  droppedFrames: 0,
  totalFrames: 0,
  totalInferences: 0,
  acceptedPredictions: 0,
  sessionDuration: 0,
};

/**
 * Tracks real-time performance metrics for the translation pipeline.
 *
 * Computes rolling FPS, average latency, average confidence, and counts
 * for frames, inferences, and drops.
 *
 * Usage:
 * ```tsx
 * const { metrics, recordFrame, recordInference } = usePerformanceMetrics();
 * ```
 */
export function usePerformanceMetrics(): UsePerformanceMetricsReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ ...INITIAL_METRICS });

  const frameTimesRef = useRef<number[]>([]);
  const inferenceTimesRef = useRef<{ latency: number; confidence: number; time: number }[]>([]);
  const confidenceSumRef = useRef(0);
  const sessionStartRef = useRef<number>(Date.now());
  const totalsRef = useRef({
    frames: 0,
    inferences: 0,
    accepted: 0,
    dropped: 0,
  });

  const updateMetrics = useCallback(() => {
    const now = Date.now();
    const sessionDuration = (now - sessionStartRef.current) / 1000;

    const frameWindow = frameTimesRef.current.filter((t) => now - t < 1000);
    frameTimesRef.current = frameWindow;

    const inferenceWindow = inferenceTimesRef.current.filter((e) => now - e.time < 5000);
    inferenceTimesRef.current = inferenceWindow;
    const totalLatency = inferenceWindow.reduce((sum, e) => sum + e.latency, 0);
    const totalConf = inferenceWindow.reduce((sum, e) => sum + e.confidence, 0);

    setMetrics({
      cameraFps: frameWindow.length,
      inferenceFps: Math.round((inferenceWindow.length / 5) * 10) / 10,
      avgLatency: inferenceWindow.length > 0 ? Math.round(totalLatency / inferenceWindow.length) : 0,
      avgConfidence: inferenceWindow.length > 0 ? Math.round((totalConf / inferenceWindow.length) * 100) / 100 : 0,
      droppedFrames: totalsRef.current.dropped,
      totalFrames: totalsRef.current.frames,
      totalInferences: totalsRef.current.inferences,
      acceptedPredictions: totalsRef.current.accepted,
      sessionDuration: Math.round(sessionDuration * 10) / 10,
    });
  }, []);

  const recordFrame = useCallback(() => {
    frameTimesRef.current.push(Date.now());
    totalsRef.current.frames += 1;
    updateMetrics();
  }, [updateMetrics]);

  const recordInference = useCallback(
    (latencyMs: number, confidence: number, accepted: boolean) => {
      inferenceTimesRef.current.push({ latency: latencyMs, confidence, time: Date.now() });
      confidenceSumRef.current += confidence;
      totalsRef.current.inferences += 1;
      if (accepted) totalsRef.current.accepted += 1;

      updateMetrics();
    },
    [updateMetrics],
  );

  const recordDrop = useCallback(() => {
    totalsRef.current.dropped += 1;
    updateMetrics();
  }, [updateMetrics]);

  const reset = useCallback(() => {
    frameTimesRef.current = [];
    inferenceTimesRef.current = [];
    confidenceSumRef.current = 0;
    sessionStartRef.current = Date.now();
    totalsRef.current = { frames: 0, inferences: 0, accepted: 0, dropped: 0 };
    setMetrics({ ...INITIAL_METRICS });
  }, []);

  return { metrics, recordFrame, recordInference, recordDrop, reset };
}

export default usePerformanceMetrics;
