'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCamera } from './useCamera';
import { useAIInference, type AiConnectionStatus } from './useAIInference';
import { useSlidingWindow } from './useSlidingWindow';
import { usePredictionSmoothing } from './usePredictionSmoothing';
import { usePerformanceMetrics, type PerformanceMetrics } from './usePerformanceMetrics';
import type { AiPredictionResult, AiHealthResponse } from '@/lib/ai-inference-api';
import type { PredictionHistoryItem } from '@/components/ai/PredictionHistory';
import { extractPoseFromVideo } from '@/lib/pose-extraction';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionState = 'idle' | 'running' | 'paused' | 'stopped';

export interface TranslationSettings {
  /** Inference FPS (frames per second sent to backend). Default 5. */
  inferenceFps: number;
  /** Confidence threshold [0-1]. Default 0.70. */
  confidenceThreshold: number;
  /** Sliding window buffer size. Default 30. */
  bufferSize: number;
  /** Smoothing window size (recent predictions to consider). Default 5. */
  smoothingWindow: number;
  /** Auto-start camera on mount. Default false. */
  autoStart: boolean;
}

export interface UseRealtimeTranslationReturn {
  sessionState: SessionState;
  settings: TranslationSettings;
  updateSettings: (patch: Partial<TranslationSettings>) => void;

  camera: ReturnType<typeof useCamera>;
  aiInference: ReturnType<typeof useAIInference>;

  currentTranslation: string;
  currentConfidence: number;
  currentLatency: number;
  isNewTranslation: boolean;

  history: PredictionHistoryItem[];
  clearHistory: () => void;

  metrics: PerformanceMetrics;
  aiConnectionStatus: AiConnectionStatus;
  aiHealth: AiHealthResponse | null;

  startSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  resetSession: () => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: TranslationSettings = {
  inferenceFps: 5,
  confidenceThreshold: 0.7,
  bufferSize: 30,
  smoothingWindow: 5,
  autoStart: false,
};

const MAX_HISTORY = 20;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Orchestrates the entire real-time ISL translation pipeline.
 *
 * Combines camera, AI inference, sliding window, prediction smoothing,
 * performance metrics, and session management into a single hook.
 */
export function useRealtimeTranslation(
  initialSettings?: Partial<TranslationSettings>,
): UseRealtimeTranslationReturn {
  const [settings, setSettings] = useState<TranslationSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [currentLatency, setCurrentLatency] = useState(0);
  const [isNewTranslation, setIsNewTranslation] = useState(false);

  const camera = useCamera({ autoStart: false });
  const aiInference = useAIInference({ healthCheckInterval: 10_000, offlineThreshold: 3 });
  const slidingWindow = useSlidingWindow({ bufferSize: settings.bufferSize });
  const smoothing = usePredictionSmoothing({
    windowSize: settings.smoothingWindow,
    confidenceThreshold: settings.confidenceThreshold,
  });
  const perfMetrics = usePerformanceMetrics();

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const sessionStateRef = useRef(sessionState);
  sessionStateRef.current = sessionState;

  const inferenceBusyRef = useRef(false);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const captureAndInfer = useCallback(async () => {
    if (sessionStateRef.current !== 'running') return;
    if (inferenceBusyRef.current) {
      perfMetrics.recordDrop();
      return;
    }

    const video = camera.videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    inferenceBusyRef.current = true;
    const startTime = performance.now();

    try {
      const landmarks = await extractPoseFromVideo(video, performance.now());
      if (!landmarks) {
        perfMetrics.recordFrame();
        inferenceBusyRef.current = false;
        return;
      }

      slidingWindow.pushFrame(landmarks);

      if (!slidingWindow.isFull) {
        perfMetrics.recordFrame();
        return;
      }

      const window = slidingWindow.getWindow();
      const poseSequence = window;

      const result = await aiInference.predict({
        pose_sequence: poseSequence,
        max_length: 50,
      });

      const latency = performance.now() - startTime;
      const text = result.prediction?.text || '';
      const conf = result.confidence || 0;

      const stable = smoothing.feedPrediction(text, conf);
      const accepted = stable !== '' && conf >= settingsRef.current.confidenceThreshold;

      perfMetrics.recordInference(latency, conf, accepted);

      if (accepted && stable) {
        setCurrentTranslation(stable);
        setCurrentConfidence(smoothing.stableConfidence);
        setCurrentLatency(Math.round(latency));
        setIsNewTranslation(smoothing.isNew);

        if (smoothing.isNew) {
          setHistory((prev) => {
            const item: PredictionHistoryItem = {
              id: `pred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              result: {
                prediction: { text: stable, tokens: result.prediction?.tokens || [] },
                confidence: smoothing.stableConfidence,
                processing_time_ms: result.processing_time_ms,
                model_version: result.model_version,
              },
              timestamp: Date.now(),
            };
            return [item, ...prev].slice(0, MAX_HISTORY);
          });
        }
      }
    } catch (err) {
      perfMetrics.recordDrop();
    } finally {
      inferenceBusyRef.current = false;
    }
  }, [camera, aiInference, slidingWindow, smoothing, perfMetrics]);

  const startSession = useCallback(async () => {
    try {
      if (camera.status !== 'active') {
        await camera.startCamera();
      }
      setSessionState('running');
      perfMetrics.reset();
    } catch (err) {
      setSessionState('idle');
    }
  }, [camera, perfMetrics]);

  useEffect(() => {
    if (sessionState === 'running') {
      const intervalMs = 1000 / settingsRef.current.inferenceFps;
      frameIntervalRef.current = setInterval(captureAndInfer, intervalMs);
    } else {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    }
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [sessionState, captureAndInfer]);

  const pauseSession = useCallback(() => {
    setSessionState('paused');
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState('running');
  }, []);

  const stopSession = useCallback(() => {
    setSessionState('stopped');
    camera.stopCamera();
    slidingWindow.clear();
    smoothing.clear();
  }, [camera, slidingWindow, smoothing]);

  const resetSession = useCallback(() => {
    setSessionState('idle');
    camera.stopCamera();
    slidingWindow.clear();
    smoothing.clear();
    perfMetrics.reset();
    setHistory([]);
    setCurrentTranslation('');
    setCurrentConfidence(0);
    setCurrentLatency(0);
    setIsNewTranslation(false);
  }, [camera, slidingWindow, smoothing, perfMetrics]);

  const updateSettings = useCallback((patch: Partial<TranslationSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, []);

  return {
    sessionState,
    settings,
    updateSettings,
    camera,
    aiInference,
    currentTranslation,
    currentConfidence,
    currentLatency,
    isNewTranslation,
    history,
    clearHistory,
    metrics: perfMetrics.metrics,
    aiConnectionStatus: aiInference.connectionStatus,
    aiHealth: aiInference.health,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetSession,
  };
}

export default useRealtimeTranslation;
