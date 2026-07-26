/**
 * AI Inference API Client
 *
 * Direct client for the FastAPI inference service (PoseTransformer).
 * This is separate from the backend REST API (api.ts) which handles
 * auth, sessions, and persistence.
 */

export const AI_SERVICE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

const TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Types matching the FastAPI schemas (apps/ai-service/schemas.py)
// ---------------------------------------------------------------------------

export interface AiHealthResponse {
  status: string;
  model_loaded: boolean;
  model_version: string;
  uptime_seconds: number;
}

export interface AiModelInfo {
  model_name: string;
  model_version: string;
  vocab_size: number;
  d_model: number;
  num_heads: number;
  num_encoder_layers: number;
  num_decoder_layers: number;
  num_parameters: number;
  max_seq_length: number;
  num_landmarks: number;
  num_features: number;
  device: string;
}

export interface AiPrediction {
  text: string;
  tokens: number[];
}

export interface AiPredictionResult {
  prediction: AiPrediction;
  confidence: number;
  processing_time_ms: number;
  model_version: string;
}

export interface AiWebcamResult extends AiPredictionResult {
  session_id: string | null;
}

export interface AiErrorResponse {
  error: string;
  detail: string;
  model_version?: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface PredictPayload {
  pose_sequence: number[][][];
  max_length?: number;
  temperature?: number;
}

export interface WebcamFramePayload {
  frame_data: number[][][];
  session_id?: string;
}

// ---------------------------------------------------------------------------
// Custom error
// ---------------------------------------------------------------------------

export class AiServiceError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string, modelVersion?: string) {
    super(detail);
    this.name = 'AiServiceError';
    this.status = status;
    this.detail = detail;
  }
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function aiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${AI_SERVICE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body: AiErrorResponse = await res.json();
        detail = body.detail || body.error || detail;
      } catch {
        // body not JSON
      }
      throw new AiServiceError(res.status, detail);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof AiServiceError) throw err;
    if (err.name === 'AbortError') {
      throw new AiServiceError(408, 'Request timed out');
    }
    // Network / CORS / offline
    throw new AiServiceError(0, err.message || 'Network error');
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const aiInferenceApi = {
  /** Check whether the AI service is reachable and the model is loaded. */
  async health(): Promise<AiHealthResponse> {
    return aiFetch<AiHealthResponse>('/health');
  },

  /** Retrieve model architecture / configuration details. */
  async modelInfo(): Promise<AiModelInfo> {
    return aiFetch<AiModelInfo>('/model/info');
  },

  /** Send a pose sequence for translation. */
  async predict(payload: PredictPayload): Promise<AiPredictionResult> {
    return aiFetch<AiPredictionResult>('/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Translate a single webcam frame (wraps predict with session tracking). */
  async webcamFrame(payload: WebcamFramePayload): Promise<AiWebcamResult> {
    return aiFetch<AiWebcamResult>('/webcam/frame', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default aiInferenceApi;
