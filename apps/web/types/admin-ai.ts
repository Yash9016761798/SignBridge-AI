export type ServiceStatus = 'healthy' | 'warning' | 'offline' | 'degraded';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AiSystemHealth {
  backend: { status: ServiceStatus; latency: number; lastCheck: string };
  aiService: { status: ServiceStatus; latency: number; lastCheck: string };
  database: { status: ServiceStatus; latency: number; lastCheck: string };
  firebase: { status: ServiceStatus; latency: number; lastCheck: string };
  model: { status: ServiceStatus; loaded: boolean; version: string };
  gpu: { available: boolean; mode: string };
  demoMode: boolean;
  overallStatus: ServiceStatus;
}

export interface AiModelInfo {
  modelName: string;
  checkpoint: string;
  modelVersion: string;
  framework: string;
  pytorchVersion: string;
  mediapipeVersion: string;
  inferenceDevice: string;
  vocabSize: number;
  dModel: number;
  numHeads: number;
  numEncoderLayers: number;
  numDecoderLayers: number;
  numParameters: number;
  maxSeqLength: number;
  numLandmarks: number;
  numFeatures: number;
  loadedAt: string;
}

export interface AiRealtimeMetrics {
  inferenceCount: number;
  averageLatency: number;
  failedRequests: number;
  queueLength: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  gpuUsagePercent: number | null;
  throughputPerMinute: number;
  lastPredictionAt: string | null;
}

export interface AiPredictionRecord {
  id: string;
  timestamp: string;
  prediction: string;
  confidence: number;
  latencyMs: number;
  userId: string | null;
  userName: string | null;
  status: 'success' | 'failed' | 'timeout';
  modelVersion: string;
}

export interface AiErrorLog {
  id: string;
  timestamp: string;
  module: string;
  severity: ErrorSeverity;
  message: string;
  stackTrace: string | null;
  resolved: boolean;
}

export interface AiChartDataPoint {
  label: string;
  value: number;
}

export interface AiServiceAction {
  id: string;
  name: string;
  description: string;
  available: boolean;
  lastExecuted: string | null;
  lastResult: 'success' | 'failed' | null;
}
