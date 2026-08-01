import type {
  AiSystemHealth,
  AiModelInfo,
  AiRealtimeMetrics,
  AiPredictionRecord,
  AiErrorLog,
  AiChartDataPoint,
  AiServiceAction,
  ErrorSeverity,
} from '@/types/admin-ai';

const USERS = ['Alice M.', 'Bob K.', 'Charlie D.', 'Diana R.', 'Eve S.', 'Frank T.', 'Grace L.', 'Hank P.'];
const PREDICTIONS = [
  'Hello', 'Thank You', 'Yes', 'No', 'Please', 'Sorry', 'Help',
  'Good Morning', 'Good Night', 'How Are You', 'My Name Is', 'Nice To Meet You',
  'Goodbye', 'Please Help Me', 'I Understand',
];
const INPUT_TYPES = ['pose', 'hand', 'face'];
const MODULES = [
  'InferenceEngine', 'ModelLoader', 'Preprocessor', 'TextDecoder',
  'RateLimiter', 'CORS', 'PoseTracker', 'TokenManager',
];
const ERROR_MESSAGES = [
  'Model inference timeout after 30s',
  'Invalid pose sequence shape: expected (T,33,5)',
  'CUDA out of memory — falling back to CPU',
  'Rate limit exceeded for client 192.168.1.x',
  'Checkpoint file not found at path',
  'Decoder token generation failed — EOS not reached',
  'Pose landmarks out of expected range',
  'Model loaded in degraded mode — partial weights',
  'Connection refused: AI service unreachable',
  'Memory allocation failed — insufficient heap',
];
const ERROR_TYPES = [
  'TimeoutError', 'ValueError', 'RuntimeError', 'ConnectionError',
  'MemoryError', 'FileNotFoundError', 'IndexError', 'OSError',
];

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
      processingTimeMs: status === 'success' ? rand(12, 80) : rand(150, 3000),
      userId: Math.random() > 0.3 ? `user-${Math.floor(rand(1, 50))}` : null,
      userName: Math.random() > 0.3 ? pick(USERS) : null,
      inputType: pick(INPUT_TYPES),
      status,
      modelVersion: '1.0.0',
    });
  }
  return records;
}

function generateErrors(count: number): AiErrorLog[] {
  const errors: AiErrorLog[] = [];
  const now = Date.now();
  const statuses: AiErrorLog['status'][] = ['open', 'acknowledged', 'resolved'];
  const severities: ErrorSeverity[] = ['info', 'warning', 'error', 'critical'];
  for (let i = 0; i < count; i++) {
    const severity = pick(severities);
    errors.push({
      id: `err-${count - i}`,
      timestamp: new Date(now - i * rand(120_000, 600_000)).toISOString(),
      module: pick(MODULES),
      severity,
      errorType: pick(ERROR_TYPES),
      message: pick(ERROR_MESSAGES),
      stackTrace: Math.random() > 0.5
        ? `File "${pick(MODULES).toLowerCase()}.py", line ${Math.floor(rand(10, 200))}\n  ${pick(ERROR_MESSAGES)}\n  ${severity === 'critical' ? 'SystemExit' : 'RuntimeError'}: inference failed`
        : null,
      status: pick(statuses),
    });
  }
  return errors;
}

function timeLabels(count: number): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3_600_000);
    labels.push(`${String(d.getHours()).padStart(2, '0')}:00`);
  }
  return labels;
}

function fluctuatingSeries(base: number, variance: number, count: number): number[] {
  return Array.from({ length: count }, () => Math.max(0, base + rand(-variance, variance)));
}

let metrics: AiRealtimeMetrics = {
  inferenceCount: 1847,
  averageLatency: 42.3,
  failedRequests: 23,
  queueLength: 0,
  memoryUsageMb: 512,
  cpuUsagePercent: 34,
  gpuUsagePercent: null,
  throughputPerMinute: 12,
  lastPredictionAt: new Date(Date.now() - 15000).toISOString(),
  predictionsToday: 1847,
  translationsToday: 1623,
  averageConfidence: 0.87,
  uptime: '2d 14h 32m',
};

const predictions = generatePredictions(50);
const errors = generateErrors(12);

export const adminAiApi = {
  async getSystemHealth(): Promise<AiSystemHealth> {
    await delay(300);
    return {
      aiService: { status: 'demo', latency: Math.floor(rand(5, 30)), lastCheck: new Date().toISOString() },
      backend: { status: 'healthy', latency: Math.floor(rand(2, 15)), lastCheck: new Date().toISOString() },
      database: { status: 'offline', latency: 0, lastCheck: new Date().toISOString() },
      storage: { status: 'healthy', latency: Math.floor(rand(1, 5)), lastCheck: new Date().toISOString() },
      memory: { status: Math.random() > 0.7 ? 'warning' : 'healthy', latency: 0, lastCheck: new Date().toISOString() },
      cpu: { status: Math.random() > 0.8 ? 'warning' : 'healthy', latency: 0, lastCheck: new Date().toISOString() },
      gpu: { status: 'offline', latency: 0, lastCheck: new Date().toISOString() },
      network: { status: 'healthy', latency: Math.floor(rand(1, 10)), lastCheck: new Date().toISOString() },
      model: { status: 'degraded', loaded: false, version: 'N/A (Demo)' },
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
      lastUpdated: new Date(Date.now() - 86400_000).toISOString(),
      modelSizeMb: 0.35,
      confidenceThreshold: 0.7,
      predictionTimeout: 30,
      inferenceMode: 'Demo (No Model)',
    };
  },

  async getRealtimeMetrics(): Promise<AiRealtimeMetrics> {
    await delay(150);
    metrics.inferenceCount += Math.floor(rand(0, 3));
    metrics.predictionsToday = metrics.inferenceCount;
    metrics.translationsToday = Math.floor(metrics.inferenceCount * 0.88);
    metrics.averageLatency = Math.max(15, metrics.averageLatency + rand(-2, 2));
    metrics.averageConfidence = Math.min(1, Math.max(0.5, metrics.averageConfidence + rand(-0.02, 0.02)));
    metrics.memoryUsageMb = Math.max(256, Math.min(1024, metrics.memoryUsageMb + rand(-10, 10)));
    metrics.cpuUsagePercent = Math.max(5, Math.min(95, metrics.cpuUsagePercent + rand(-3, 3)));
    metrics.throughputPerMinute = Math.max(5, Math.min(30, metrics.throughputPerMinute + rand(-1, 1)));
    metrics.lastPredictionAt = new Date(Date.now() - rand(5000, 60000)).toISOString();
    return { ...metrics };
  },

  async getPredictionHistory(
    page = 1,
    limit = 15,
    search = '',
    sortField: 'timestamp' | 'confidence' | 'latencyMs' = 'timestamp',
    sortDir: 'asc' | 'desc' = 'desc',
  ): Promise<{ data: AiPredictionRecord[]; total: number }> {
    await delay(250);
    let filtered = [...predictions];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.prediction.toLowerCase().includes(q)
          || (p.userName && p.userName.toLowerCase().includes(q))
          || p.status.includes(q)
          || p.inputType.includes(q),
      );
    }
    filtered.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'timestamp') return mul * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return mul * ((a[sortField] as number) - (b[sortField] as number));
    });
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total: filtered.length };
  },

  async getErrorLogs(): Promise<AiErrorLog[]> {
    await delay(200);
    return [...errors];
  },

  async getCharts(): Promise<{
    predictionsOverTime: AiChartDataPoint[];
    averageConfidence: AiChartDataPoint[];
    responseTime: AiChartDataPoint[];
    successRate: AiChartDataPoint[];
    errorRate: AiChartDataPoint[];
    predictionsPerMinute: AiChartDataPoint[];
    inferenceLatency: AiChartDataPoint[];
  }> {
    await delay(300);
    const labels = timeLabels(8);
    return {
      predictionsOverTime: labels.map((label, i) => ({ label, value: Math.floor(150 + i * 25 + rand(-20, 20)) })),
      averageConfidence: labels.map((label, i) => ({ label, value: Math.round((0.82 + i * 0.01 + rand(-0.03, 0.03)) * 100) / 100 })),
      responseTime: labels.map((label, i) => ({ label, value: Math.round(35 + i * 2 + rand(-5, 5)) })),
      successRate: labels.map((label) => ({ label, value: Math.round((90 + rand(-5, 8)) * 10) / 10 })),
      errorRate: labels.map((label) => ({ label, value: Math.round((8 - rand(0, 6)) * 10) / 10 })),
      predictionsPerMinute: labels.map((label, i) => ({ label, value: Math.floor(8 + i * 1.5 + rand(-2, 2)) })),
      inferenceLatency: labels.map((label, i) => ({ label, value: Math.round(25 + i * 1.5 + rand(-4, 4)) })),
    };
  },

  async getServiceActions(): Promise<AiServiceAction[]> {
    await delay(100);
    return [
      { id: 'reload', name: 'Reload Model', description: 'Reload the model from checkpoint', available: false, lastExecuted: null, lastResult: null },
      { id: 'restart', name: 'Restart AI Service', description: 'Restart the FastAPI inference service', available: false, lastExecuted: null, lastResult: null },
      { id: 'clear-cache', name: 'Clear Cache', description: 'Clear prediction cache and free memory', available: false, lastExecuted: null, lastResult: null },
      { id: 'download-logs', name: 'Download Logs', description: 'Download AI service logs for debugging', available: false, lastExecuted: null, lastResult: null },
      { id: 'retrain', name: 'Retrain Model', description: 'Start a model retraining job', available: false, lastExecuted: null, lastResult: null },
      { id: 'refresh', name: 'Refresh Metrics', description: 'Force refresh all monitoring metrics', available: true, lastExecuted: new Date(Date.now() - 120_000).toISOString(), lastResult: 'success' },
    ];
  },

  async executeAction(actionId: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    if (actionId === 'refresh') return { success: true, message: 'Metrics refreshed successfully' };
    // TODO: implement reload/restart/clear-cache/download-logs/retrain when backend endpoints exist
    return { success: false, message: 'This action requires backend admin endpoints that are not yet implemented.' };
  },

  async dismissError(errorId: string): Promise<void> {
    await delay(100);
    const idx = errors.findIndex((e) => e.id === errorId);
    if (idx !== 1) errors[idx].status = 'resolved';
  },
};
