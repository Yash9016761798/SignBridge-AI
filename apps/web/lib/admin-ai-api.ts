import type {
  AiSystemHealth,
  AiModelInfo,
  AiRealtimeMetrics,
  AiPredictionRecord,
  AiErrorLog,
  AiChartDataPoint,
  AiServiceAction,
  ServiceStatus,
  ErrorSeverity,
} from '@/types/admin-ai';

const USERS = ['Alice M.', 'Bob K.', 'Charlie D.', 'Diana R.', 'Eve S.', 'Frank T.', 'Grace L.', 'Hank P.'];
const PREDICTIONS = ['Hello', 'Thank You', 'Yes', 'No', 'Please', 'Sorry', 'Help', 'Good Morning', 'Good Night', 'How Are You'];

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generatePredictions(count: number): AiPredictionRecord[] {
  const records: AiPredictionRecord[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const ts = new Date(now - i * rand(60_000, 300_000));
    const status = Math.random() > 0.08 ? 'success' : Math.random() > 0.5 ? 'failed' : 'timeout';
    records.push({
      id: `pred-${count - i}`,
      timestamp: ts.toISOString(),
      prediction: pick(PREDICTIONS),
      confidence: status === 'success' ? rand(0.72, 0.99) : rand(0.1, 0.5),
      latencyMs: status === 'success' ? rand(18, 120) : rand(200, 5000),
      userId: Math.random() > 0.3 ? `user-${Math.floor(rand(1, 50))}` : null,
      userName: Math.random() > 0.3 ? pick(USERS) : null,
      status,
      modelVersion: '1.0.0',
    });
  }
  return records;
}

function generateErrors(count: number): AiErrorLog[] {
  const modules = ['InferenceEngine', 'ModelLoader', 'Preprocessor', 'TextDecoder', 'RateLimiter', 'CORS'];
  const messages = [
    'Model inference timeout after 30s',
    'Invalid pose sequence shape: expected (T,33,5)',
    'CUDA out of memory — falling back to CPU',
    'Rate limit exceeded for client 192.168.1.x',
    'Checkpoint file not found at path',
    'Decoder token generation failed — EOS not reached',
    'Pose landmarks out of expected range',
    'Model loaded in degraded mode — partial weights',
  ];
  const severities: ErrorSeverity[] = ['info', 'warning', 'error', 'critical'];
  const errors: AiErrorLog[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    errors.push({
      id: `err-${count - i}`,
      timestamp: new Date(now - i * rand(120_000, 600_000)).toISOString(),
      module: pick(modules),
      severity: pick(severities),
      message: pick(messages),
      stackTrace: Math.random() > 0.5 ? `File "${pick(modules).toLowerCase()}.py", line ${Math.floor(rand(10, 200))}\n  ${pick(messages)}\n  RuntimeError: inference failed` : null,
      resolved: Math.random() > 0.6,
    });
  }
  return errors;
}

function generateChartData(points: number, base: number, variance: number): AiChartDataPoint[] {
  const labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Now'];
  return Array.from({ length: points }, (_, i) => ({
    label: labels[i % labels.length] || `${i}h`,
    value: Math.max(0, base + rand(-variance, variance)),
  }));
}

let metrics = {
  inferenceCount: 1847,
  averageLatency: 42.3,
  failedRequests: 23,
  queueLength: 0,
  memoryUsageMb: 512,
  cpuUsagePercent: 34,
  gpuUsagePercent: null as number | null,
  throughputPerMinute: 12,
  lastPredictionAt: new Date(Date.now() - 15000).toISOString(),
};

const predictions = generatePredictions(50);
const errors = generateErrors(12);

export const adminAiApi = {
  async getSystemHealth(): Promise<AiSystemHealth> {
    await delay(300);
    return {
      backend: { status: 'healthy', latency: Math.floor(rand(2, 15)), lastCheck: new Date().toISOString() },
      aiService: { status: 'demo' as unknown as ServiceStatus, latency: Math.floor(rand(5, 30)), lastCheck: new Date().toISOString() },
      database: { status: 'offline' as unknown as ServiceStatus, latency: 0, lastCheck: new Date().toISOString() },
      firebase: { status: 'offline' as unknown as ServiceStatus, latency: 0, lastCheck: new Date().toISOString() },
      model: { status: 'degraded', loaded: false, version: 'N/A (Demo Mode)' },
      gpu: { available: false, mode: 'CPU' },
      demoMode: true,
      overallStatus: 'warning',
    };
  },

  async getModelInfo(): Promise<AiModelInfo> {
    await delay(200);
    return {
      modelName: 'PoseTransformer',
      checkpoint: 'experiments/representative/checkpoints/best.pt',
      modelVersion: '1.0.0',
      framework: 'PyTorch',
      pytorchVersion: '2.x',
      mediapipeVersion: '0.10.x',
      inferenceDevice: 'CPU',
      vocabSize: 978,
      dModel: 32,
      numHeads: 4,
      numEncoderLayers: 1,
      numDecoderLayers: 1,
      numParameters: 90450,
      maxSeqLength: 30,
      numLandmarks: 33,
      numFeatures: 5,
      loadedAt: new Date(Date.now() - 3600_000).toISOString(),
    };
  },

  async getRealtimeMetrics(): Promise<AiRealtimeMetrics> {
    await delay(150);
    metrics.inferenceCount += Math.floor(rand(0, 3));
    metrics.averageLatency = Math.max(15, metrics.averageLatency + rand(-2, 2));
    metrics.memoryUsageMb = Math.max(256, Math.min(1024, metrics.memoryUsageMb + rand(-10, 10)));
    metrics.cpuUsagePercent = Math.max(5, Math.min(95, metrics.cpuUsagePercent + rand(-3, 3)));
    metrics.lastPredictionAt = new Date(Date.now() - rand(5000, 60000)).toISOString();
    return { ...metrics };
  },

  async getPredictionHistory(page = 1, limit = 15): Promise<{ data: AiPredictionRecord[]; total: number }> {
    await delay(250);
    const start = (page - 1) * limit;
    return { data: predictions.slice(start, start + limit), total: predictions.length };
  },

  async getErrorLogs(): Promise<AiErrorLog[]> {
    await delay(200);
    return [...errors];
  },

  async getPredictionChart(): Promise<AiChartDataPoint[]> {
    await delay(200);
    return generateChartData(7, 45, 20);
  },

  async getLatencyChart(): Promise<AiChartDataPoint[]> {
    await delay(200);
    return generateChartData(7, 42, 15);
  },

  async getConfidenceChart(): Promise<AiChartDataPoint[]> {
    await delay(200);
    return [
      { label: '0-20%', value: 3 },
      { label: '20-40%', value: 8 },
      { label: '40-60%', value: 22 },
      { label: '60-80%', value: 45 },
      { label: '80-100%', value: 67 },
    ];
  },

  async getSuccessRateChart(): Promise<AiChartDataPoint[]> {
    await delay(200);
    return generateChartData(7, 92, 5);
  },

  async getServiceActions(): Promise<AiServiceAction[]> {
    await delay(100);
    return [
      { id: 'reload', name: 'Reload Model', description: 'Reload the model from checkpoint', available: false, lastExecuted: null, lastResult: null },
      { id: 'restart', name: 'Restart AI Service', description: 'Restart the FastAPI inference service', available: false, lastExecuted: null, lastResult: null },
      { id: 'clear-cache', name: 'Clear Cache', description: 'Clear prediction cache and free memory', available: false, lastExecuted: null, lastResult: null },
      { id: 'refresh', name: 'Refresh Metrics', description: 'Force refresh all monitoring metrics', available: true, lastExecuted: new Date(Date.now() - 120_000).toISOString(), lastResult: 'success' },
    ];
  },

  async executeAction(actionId: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    if (actionId === 'refresh') return { success: true, message: 'Metrics refreshed successfully' };
    // TODO: implement reload/restart/clear-cache when backend endpoints exist
    return { success: false, message: 'This action requires backend admin endpoints that are not yet implemented.' };
  },

  async dismissError(errorId: string): Promise<void> {
    await delay(100);
    const idx = errors.findIndex((e) => e.id === errorId);
    if (idx !== -1) errors[idx].resolved = true;
  },
};
