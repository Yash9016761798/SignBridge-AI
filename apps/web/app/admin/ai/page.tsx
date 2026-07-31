'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Activity,
  Cpu,
  Database,
  Shield,
  Zap,
  Server,
  RefreshCw,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  TrendingUp,
  BarChart3,
  Gauge,
  MemoryStick,
  HardDrive,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { adminAiApi } from '@/lib/admin-ai-api';
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

const statusColors: Record<ServiceStatus, { bg: string; text: string; dot: string }> = {
  healthy: { bg: 'bg-success-50 dark:bg-success-500/10', text: 'text-success-700 dark:text-success-500', dot: 'bg-success-500' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-500/10', text: 'text-warning-700 dark:text-warning-500', dot: 'bg-warning-500' },
  offline: { bg: 'bg-surface-100 dark:bg-surface-800', text: 'text-surface-500 dark:text-surface-400', dot: 'bg-surface-400' },
  degraded: { bg: 'bg-warning-50 dark:bg-warning-500/10', text: 'text-warning-700 dark:text-warning-500', dot: 'bg-warning-500' },
};

const severityColors: Record<ErrorSeverity, { bg: string; text: string; icon: React.ElementType }> = {
  info: { bg: 'bg-info-50 dark:bg-info-500/10', text: 'text-info-600 dark:text-info-500', icon: CheckCircle2 },
  warning: { bg: 'bg-warning-50 dark:bg-warning-500/10', text: 'text-warning-600 dark:text-warning-500', icon: AlertTriangle },
  error: { bg: 'bg-danger-50 dark:bg-danger-500/10', text: 'text-danger-600 dark:text-danger-500', icon: XCircle },
  critical: { bg: 'bg-danger-100 dark:bg-danger-500/20', text: 'text-danger-700 dark:text-danger-400', icon: XCircle },
};

const serviceIcons: Record<string, React.ElementType> = {
  backend: Server,
  aiService: Brain,
  database: Database,
  firebase: Shield,
  model: Cpu,
};

function SimpleBarChart({ data }: { data: AiChartDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-2xs text-surface-500 font-medium">{Math.round(d.value)}</span>
          <div className="w-full rounded-t-md bg-primary-400 transition-all" style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="text-2xs text-surface-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function ConfidenceChart({ data }: { data: AiChartDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors = ['bg-danger-400', 'bg-warning-400', 'bg-sky-400', 'bg-primary-400', 'bg-success-400'];
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <span className="text-2xs text-surface-500 font-medium">{d.value}</span>
          <div className={`w-full rounded-t-md ${colors[i % colors.length]} transition-all`} style={{ height: `${(d.value / max) * 100}%` }} />
          <span className="text-2xs text-surface-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAiPage() {
  const [health, setHealth] = useState<AiSystemHealth | null>(null);
  const [modelInfo, setModelInfo] = useState<AiModelInfo | null>(null);
  const [metrics, setMetrics] = useState<AiRealtimeMetrics | null>(null);
  const [predictions, setPredictions] = useState<AiPredictionRecord[]>([]);
  const [predTotal, setPredTotal] = useState(0);
  const [predPage, setPredPage] = useState(1);
  const [errorLogs, setErrorLogs] = useState<AiErrorLog[]>([]);
  const [actions, setActions] = useState<AiServiceAction[]>([]);
  const [predChart, setPredChart] = useState<AiChartDataPoint[]>([]);
  const [latencyChart, setLatencyChart] = useState<AiChartDataPoint[]>([]);
  const [confidenceChart, setConfidenceChart] = useState<AiChartDataPoint[]>([]);
  const [successChart, setSuccessChart] = useState<AiChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isVisible = useRef(true);

  const fetchAll = useCallback(async () => {
    if (!isVisible.current) return;
    try {
      const [h, m, met, pRes, err, act, pc, lc, cc, sc] = await Promise.all([
        adminAiApi.getSystemHealth(),
        adminAiApi.getModelInfo(),
        adminAiApi.getRealtimeMetrics(),
        adminAiApi.getPredictionHistory(predPage),
        adminAiApi.getErrorLogs(),
        adminAiApi.getServiceActions(),
        adminAiApi.getPredictionChart(),
        adminAiApi.getLatencyChart(),
        adminAiApi.getConfidenceChart(),
        adminAiApi.getSuccessRateChart(),
      ]);
      setHealth(h);
      setModelInfo(m);
      setMetrics(met);
      setPredictions(pRes.data);
      setPredTotal(pRes.total);
      setErrorLogs(err);
      setActions(act);
      setPredChart(pc);
      setLatencyChart(lc);
      setConfidenceChart(cc);
      setSuccessChart(sc);
    } catch { /* ignore */ }
    setLoading(false);
  }, [predPage]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    refreshTimer.current = setInterval(() => { if (isVisible.current) fetchAll(); }, 30000);
    const onVis = () => { isVisible.current = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [fetchAll]);

  const handleAction = async (actionId: string) => {
    setActionLoading(actionId);
    try { await adminAiApi.executeAction(actionId); await fetchAll(); } catch { /* ignore */ }
    setActionLoading(null);
  };

  const handleDismissError = async (errorId: string) => {
    await adminAiApi.dismissError(errorId);
    setErrorLogs((prev) => prev.map((e) => e.id === errorId ? { ...e, resolved: true } : e));
  };

  const successRate = metrics ? ((metrics.inferenceCount - metrics.failedRequests) / Math.max(metrics.inferenceCount, 1) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Monitoring"
        description="Monitor AI service health, model status, and real-time metrics"
        icon={Brain}
        action={
          <button onClick={() => fetchAll()} className="btn-secondary inline-flex items-center gap-2 text-sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        }
      />

      {loading ? <SkeletonLoader count={4} /> : (
        <>
          {/* Stat Cards */}
          {health && metrics && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard
                title="AI Service"
                value={health.aiService.status === 'healthy' ? 'Online' : health.demoMode ? 'Demo' : 'Offline'}
                icon={Brain}
              />
              <StatCard title="Model" value={health.model.loaded ? 'Loaded' : 'N/A'} icon={Cpu} />
              <StatCard title="Predictions" value={metrics.inferenceCount} icon={Zap} />
              <StatCard title="Avg Latency" value={`${metrics.averageLatency.toFixed(1)}ms`} icon={Clock} />
              <StatCard title="Success Rate" value={`${successRate.toFixed(1)}%`} icon={TrendingUp} />
              <StatCard title="Failed" value={metrics.failedRequests} icon={AlertTriangle} />
            </div>
          )}

          {/* System Status + Model Info */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* System Status */}
            <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white">
                <Activity className="h-5 w-5 text-primary-500" /> System Status
                {health?.demoMode && <span className="rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-bold text-warning-700 dark:bg-warning-500/10 dark:text-warning-500">DEMO MODE</span>}
              </h3>
              <div className="space-y-3">
                {health && [
                  { key: 'backend', label: 'Backend', data: health.backend },
                  { key: 'aiService', label: 'AI Service', data: health.aiService },
                  { key: 'database', label: 'Database', data: health.database },
                  { key: 'firebase', label: 'Firebase', data: health.firebase },
                  { key: 'model', label: 'Model', data: health.model },
                ].map((item) => {
                  const Icon = serviceIcons[item.key] || Server;
                  const sc = statusColors[item.data.status];
                  return (
                    <div key={item.key} className="flex items-center justify-between rounded-[12px] border border-surface-100 p-3 dark:border-surface-800">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-surface-400" />
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {'latency' in item.data && <span className="text-xs text-surface-400">{item.data.latency}ms</span>}
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${sc.bg} ${sc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                          {item.data.status === 'healthy' ? 'Healthy' : item.data.status === 'warning' ? 'Warning' : item.data.status === 'degraded' ? 'Degraded' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {health && (
                  <div className="flex items-center justify-between rounded-[12px] border border-surface-100 p-3 dark:border-surface-800">
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-4 w-4 text-surface-400" />
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">GPU / CPU</span>
                    </div>
                    <span className="text-xs font-medium text-surface-500">{health.gpu.mode} {health.gpu.available ? '(GPU Available)' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Model Info */}
            <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white">
                <Cpu className="h-5 w-5 text-primary-500" /> Model Information
              </h3>
              {modelInfo ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Model', value: modelInfo.modelName },
                    { label: 'Version', value: modelInfo.modelVersion },
                    { label: 'Checkpoint', value: modelInfo.checkpoint.split('/').pop() },
                    { label: 'Framework', value: modelInfo.framework },
                    { label: 'PyTorch', value: modelInfo.pytorchVersion },
                    { label: 'MediaPipe', value: modelInfo.mediapipeVersion },
                    { label: 'Device', value: modelInfo.inferenceDevice },
                    { label: 'Parameters', value: `${(modelInfo.numParameters / 1000).toFixed(1)}K` },
                    { label: 'Vocab Size', value: String(modelInfo.vocabSize) },
                    { label: 'd_model', value: String(modelInfo.dModel) },
                    { label: 'Heads', value: String(modelInfo.numHeads) },
                    { label: 'Encoder Layers', value: String(modelInfo.numEncoderLayers) },
                    { label: 'Decoder Layers', value: String(modelInfo.numDecoderLayers) },
                    { label: 'Max Seq Length', value: String(modelInfo.maxSeqLength) },
                    { label: 'Landmarks', value: String(modelInfo.numLandmarks) },
                    { label: 'Features', value: String(modelInfo.numFeatures) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[10px] bg-surface-50 p-2.5 dark:bg-surface-800">
                      <p className="text-2xs text-surface-400">{item.label}</p>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{item.value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 rounded-[10px] bg-surface-50 p-2.5 dark:bg-surface-800">
                    <p className="text-2xs text-surface-400">Loaded At</p>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{new Date(modelInfo.loadedAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-surface-500">Model info unavailable</div>
              )}
            </div>
          </div>

          {/* Real-Time Metrics */}
          {metrics && (
            <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white">
                <Gauge className="h-5 w-5 text-primary-500" /> Real-Time Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Inference Count', value: metrics.inferenceCount, icon: Zap, color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400' },
                  { label: 'Avg Latency', value: `${metrics.averageLatency.toFixed(1)}ms`, icon: Clock, color: 'text-info-600 bg-info-50 dark:bg-info-500/10 dark:text-info-500' },
                  { label: 'Failed Requests', value: metrics.failedRequests, icon: XCircle, color: 'text-danger-600 bg-danger-50 dark:bg-danger-500/10 dark:text-danger-500' },
                  { label: 'Queue Length', value: metrics.queueLength, icon: Activity, color: 'text-success-600 bg-success-50 dark:bg-success-500/10 dark:text-success-500' },
                  { label: 'Memory Usage', value: `${Math.round(metrics.memoryUsageMb)}MB`, icon: MemoryStick, color: 'text-warning-600 bg-warning-50 dark:bg-warning-500/10 dark:text-warning-500' },
                  { label: 'CPU Usage', value: `${Math.round(metrics.cpuUsagePercent)}%`, icon: Cpu, color: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-500/10 dark:text-secondary-600' },
                  { label: 'GPU Usage', value: metrics.gpuUsagePercent !== null ? `${Math.round(metrics.gpuUsagePercent)}%` : 'N/A', icon: HardDrive, color: 'text-surface-600 bg-surface-100 dark:bg-surface-800 dark:text-surface-400' },
                  { label: 'Throughput', value: `${metrics.throughputPerMinute}/min`, icon: TrendingUp, color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[14px] border border-surface-100 p-3 dark:border-surface-800">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <p className="mt-2 text-lg font-bold text-surface-900 dark:text-white">{item.value}</p>
                    <p className="text-2xs text-surface-500">{item.label}</p>
                  </div>
                ))}
              </div>
              {metrics.lastPredictionAt && (
                <p className="mt-3 text-xs text-surface-400">Last prediction: {new Date(metrics.lastPredictionAt).toLocaleTimeString()}</p>
              )}
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
              <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">Prediction Volume</h3>
              <SimpleBarChart data={predChart} />
            </div>
            <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
              <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">Average Latency (ms)</h3>
              <SimpleBarChart data={latencyChart} />
            </div>
            <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
              <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">Confidence Distribution</h3>
              <ConfidenceChart data={confidenceChart} />
            </div>
            <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
              <h3 className="mb-4 text-sm font-semibold text-surface-900 dark:text-white">Success Rate (%)</h3>
              <SimpleBarChart data={successChart} />
            </div>
          </div>

          {/* Prediction History */}
          <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-primary-500" /> Prediction History
            </h3>
            <div className="overflow-x-auto rounded-[12px] border border-surface-200 dark:border-surface-700">
              <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                <thead className="bg-surface-50 dark:bg-surface-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Prediction</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden sm:table-cell">Confidence</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden md:table-cell">Latency</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500 hidden lg:table-cell">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 bg-white dark:divide-surface-800 dark:bg-surface-900">
                  {predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50">
                      <td className="px-4 py-2.5 text-xs text-surface-500">{new Date(p.timestamp).toLocaleTimeString()}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold text-surface-900 dark:text-white">{p.prediction}</td>
                      <td className="px-4 py-2.5 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                            <div className={`h-full rounded-full ${p.confidence > 0.8 ? 'bg-success-500' : p.confidence > 0.5 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${p.confidence * 100}%` }} />
                          </div>
                          <span className="text-xs text-surface-500">{(p.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-surface-500 hidden md:table-cell">{p.latencyMs.toFixed(1)}ms</td>
                      <td className="px-4 py-2.5 text-xs text-surface-500 hidden lg:table-cell">{p.userName || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold ${p.status === 'success' ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500' : p.status === 'failed' ? 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500' : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500'}`}>
                          {p.status === 'success' ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Log */}
          <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-danger-500" /> Error Log
              <span className="rounded-full bg-danger-100 px-2 py-0.5 text-2xs font-bold text-danger-600 dark:bg-danger-500/10 dark:text-danger-500">{errorLogs.filter((e) => !e.resolved).length}</span>
            </h3>
            <div className="space-y-2">
              {errorLogs.map((err) => {
                const sev = severityColors[err.severity];
                const SevIcon = sev.icon;
                const expanded = expandedError === err.id;
                return (
                  <div key={err.id} className={`rounded-[12px] border border-surface-100 dark:border-surface-800 ${err.resolved ? 'opacity-50' : ''}`}>
                    <button onClick={() => setExpandedError(expanded ? null : err.id)} className="flex w-full items-center justify-between p-3 text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${sev.bg} ${sev.text}`}>
                          <SevIcon className="h-3 w-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{err.message}</p>
                          <p className="text-2xs text-surface-400">{err.module} • {new Date(err.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {err.resolved && <span className="rounded-full bg-success-100 px-2 py-0.5 text-2xs font-bold text-success-600">Resolved</span>}
                        {!err.resolved && (
                          <button onClick={(e) => { e.stopPropagation(); handleDismissError(err.id); }} className="min-h-[28px] rounded-[8px] bg-surface-100 px-2 text-2xs font-medium text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700">
                            Dismiss
                          </button>
                        )}
                        {expanded ? <ChevronUp className="h-4 w-4 text-surface-400" /> : <ChevronDown className="h-4 w-4 text-surface-400" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {expanded && err.stackTrace && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <pre className="mx-3 mb-3 rounded-[10px) bg-surface-950 p-3 text-2xs text-surface-300 overflow-x-auto dark:bg-surface-950">
                            {err.stackTrace}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Control */}
          <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-surface-900 dark:text-white">
              <Server className="h-5 w-5 text-primary-500" /> Service Control
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {actions.map((action) => {
                const icons: Record<string, React.ElementType> = { reload: RotateCcw, restart: Play, 'clear-cache': Trash2, refresh: RefreshCw };
                const Icon = icons[action.id] || Server;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    disabled={!action.available || actionLoading === action.id}
                    className={`flex items-center gap-3 rounded-[14px] border p-4 text-left transition-all ${
                      action.available
                        ? 'border-surface-200 hover:border-primary-300 hover:bg-primary-50 dark:border-surface-700 dark:hover:border-primary-700 dark:hover:bg-primary-500/10'
                        : 'border-surface-100 opacity-50 cursor-not-allowed dark:border-surface-800'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${action.available ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' : 'bg-surface-100 text-surface-400 dark:bg-surface-800'}`}>
                      <Icon className={`h-5 w-5 ${actionLoading === action.id ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">{action.name}</p>
                      <p className="text-2xs text-surface-400 truncate">{action.description}</p>
                      {!action.available && <p className="mt-1 text-2xs text-warning-600">Requires backend endpoints</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
