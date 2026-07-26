'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import aiInferenceApi, {
  AiServiceError,
  AiHealthResponse,
  AiPredictionResult,
  type PredictPayload,
} from '@/lib/ai-inference-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AiConnectionStatus = 'unknown' | 'connected' | 'degraded' | 'offline';

export interface UseAIInferenceOptions {
  /** Interval (ms) for health checks. Default 10 000. 0 = disabled. */
  healthCheckInterval?: number;
  /** Number of consecutive failures before marking offline. Default 3. */
  offlineThreshold?: number;
}

export interface UseAIInferenceReturn {
  /** Last known health response. */
  health: AiHealthResponse | null;
  /** Derived connection status. */
  connectionStatus: AiConnectionStatus;
  /** True while a predict request is in-flight. */
  isInferring: boolean;
  /** Last prediction result. */
  lastResult: AiPredictionResult | null;
  /** Last error, if any. */
  lastError: AiServiceError | null;
  /** Call the /predict endpoint. */
  predict: (payload: PredictPayload) => Promise<AiPredictionResult>;
  /** Manually trigger a health check. */
  checkHealth: () => Promise<AiHealthResponse>;
  /** Clear the last error. */
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAIInference(
  options: UseAIInferenceOptions = {},
): UseAIInferenceReturn {
  const { healthCheckInterval = 10_000, offlineThreshold = 3 } = options;

  const [health, setHealth] = useState<AiHealthResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<AiConnectionStatus>('unknown');
  const [isInferring, setIsInferring] = useState(false);
  const [lastResult, setLastResult] = useState<AiPredictionResult | null>(null);
  const [lastError, setLastError] = useState<AiServiceError | null>(null);

  const failCountRef = useRef(0);
  const mountedRef = useRef(true);

  // ---- health check ----
  const checkHealth = useCallback(async (): Promise<AiHealthResponse> => {
    try {
      const res = await aiInferenceApi.health();
      if (!mountedRef.current) return res;
      setHealth(res);
      failCountRef.current = 0;
      setConnectionStatus(
        res.model_loaded || res.status === 'demo' ? 'connected' : 'degraded',
      );
      return res;
    } catch (err: any) {
      if (!mountedRef.current) throw err;
      failCountRef.current += 1;
      if (failCountRef.current >= offlineThreshold) {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('degraded');
      }
      throw err;
    }
  }, [offlineThreshold]);

  // ---- predict ----
  const predict = useCallback(
    async (payload: PredictPayload): Promise<AiPredictionResult> => {
      setIsInferring(true);
      setLastError(null);
      try {
        const result = await aiInferenceApi.predict(payload);
        if (mountedRef.current) {
          setLastResult(result);
          setConnectionStatus('connected');
        }
        return result;
      } catch (err: any) {
        const aiErr =
          err instanceof AiServiceError ? err : new AiServiceError(0, err.message || 'Unknown error');
        if (mountedRef.current) {
          setLastError(aiErr);
          if (aiErr.status === 0) {
            failCountRef.current += 1;
            if (failCountRef.current >= offlineThreshold) {
              setConnectionStatus('offline');
            }
          }
        }
        throw aiErr;
      } finally {
        if (mountedRef.current) setIsInferring(false);
      }
    },
    [offlineThreshold],
  );

  const clearError = useCallback(() => setLastError(null), []);

  // ---- mount: initial health check ----
  useEffect(() => {
    mountedRef.current = true;
    checkHealth().catch(() => {});
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- periodic health check ----
  useEffect(() => {
    if (healthCheckInterval <= 0) return;
    const id = setInterval(() => {
      checkHealth().catch(() => {});
    }, healthCheckInterval);
    return () => clearInterval(id);
  }, [healthCheckInterval, checkHealth]);

  return {
    health,
    connectionStatus,
    isInferring,
    lastResult,
    lastError,
    predict,
    checkHealth,
    clearError,
  };
}

export default useAIInference;
