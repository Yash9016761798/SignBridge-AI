export type ServiceStatus = 'healthy' | 'warning' | 'offline' | 'degraded' | 'demo';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AiSystemHealthItem {
  status: ServiceStatus;
  latency: number;
  lastCheck: string;
  available?: boolean;
}

export interface AiSystemHealth {
  aiService: AiSystemHealthItem;
  backend: AiSystemHealthItem;
  database: AiSystemHealthItem;
  storage: AiSystemHealthItem;
  memory: AiSystemHealthItem;
  cpu: AiSystemHealthItem;
  gpu: AiSystemHealthItem;
  network: AiSystemHealthItem;
  model: { status: ServiceStatus; loaded: boolean; version: string };
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
  lastUpdated: string;
  modelSizeMb: number;
  confidenceThreshold: number;
  predictionTimeout: number;
  inferenceMode: string;
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
  predictionsToday: number;
  translationsToday: number;
  averageConfidence: number;
  uptime: string;
}

export interface AiPredictionRecord {
  id: string;
  timestamp: string;
  prediction: string;
  confidence: number;
  latencyMs: number;
  processingTimeMs: number;
  userId: string | null;
  userName: string | null;
  inputType: string;
  status: 'success' | 'failed' | 'timeout';
  modelVersion: string;
}

export interface AiErrorLog {
  id: string;
  timestamp: string;
  module: string;
  severity: ErrorSeverity;
  errorType: string;
  message: string;
  stackTrace: string | null;
  status: 'open' | 'acknowledged' | 'resolved';
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
