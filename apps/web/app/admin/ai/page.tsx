'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, CheckCircle, Database, Download, GitBranch,
  HardDrive, Layers, Loader2, Monitor, RefreshCcw, Server, Shield,
  BrainCircuit, Zap, Clock, TrendingUp, AlertCircle, Cpu, Wifi, Eye,
  BarChart3, LineChart as LineChartIcon, ActivitySquare, Gauge,
  RotateCcw, PlayCircle, Trash2, FileText, GraduationCap,
  ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, Info,
} from 'lucide-react';
import { adminAiApi } from '@/lib/admin-ai-api';
import type {
  AiSystemHealth, AiModelInfo, AiRealtimeMetrics,
  AiPredictionRecord, AiErrorLog, AiChartDataPoint, AiServiceAction,
} from '@/types/admin-ai';
import ChartCard from '@/components/admin/charts/ChartCard';
import BarChart from '@/components/admin/charts/BarChart';
import LineChartComponent from '@/components/admin/charts/LineChart';
import DonutChart from '@/components/admin/charts/DonutChart';

function statusColor(s: string) {
  if (s === 'healthy' || s === 'success') return 'text-[#B8E6C3]';
  if (s === 'warning' || s === 'degraded') return 'text-[#F6D365]';
  if (s === 'demo') return 'text-[#A9D6F5]';
  if (s === 'offline' || s === 'error' || s === 'critical') return 'text-[#F87171]';
  return 'text-neutral-400';
}
function statusBg(s: string) {
  if (s === 'healthy' || s === 'success') return 'bg-[#B8E6C3]/10 border-[#B8E6C3]/20';
  if (s === 'warning' || s === 'degraded') return 'bg-[#F6D365]/10 border-[#F6D365]/20';
  if (s === 'demo') return 'bg-[#A9D6F5]/10 border-[#A9D6F5]/20';
  if (s === 'offline' || s === 'error' || s === 'critical') return 'bg-[#F87171]/10 border-[#F87171]/20';
  return 'bg-[#EFEFEF] border-[#EFEFEF]';
}
function statusIcon(s: string) {
  if (s === 'healthy' || s === 'success') return <CheckCircle size={14} />;
  if (s === 'warning' || s === 'degraded') return <AlertTriangle size={14} />;
  if (s === 'demo') return <PlayCircle size={14} />;
  if (s === 'offline' || s === 'error' || s === 'critical') return <AlertCircle size={14} />;
  return <Loader2 size={14} className="animate-spin" />;
}
function severityColor(s: string) {
  if (s === 'critical') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (s === 'error') return 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20';
  if (s === 'warning') return 'bg-[#F6D365]/10 text-[#F6D365] border-[#F6D365]/20';
  return 'bg-[#A9D6F5]/10 text-[#A9D6F5] border-[#A9D6F5]/20';
}

export default function AdminAiMonitoringPage() {
  const [health, setHealth] = useState<AiSystemHealth | null>(null);
  const [model, setModel] = useState<AiModelInfo | null>(null);
  const [metrics, setMetrics] = useState<AiRealtimeMetrics | null>(null);
  const [predictions, setPredictions] = useState<AiPredictionRecord[]>([]);
  const [predictionTotal, setPredictionTotal] = useState(0);
  const [predictionPage, setPredictionPage] = useState(1);
  const [predSearch, setPredSearch] = useState('');
  const [predSort, setPredSort] = useState<'timestamp' | 'confidence' | 'latencyMs'>('timestamp');
  const [predSortDir, setPredSortDir] = useState<'asc' | 'desc'>('desc');
  const [errors, setErrors] = useState<AiErrorLog[]>([]);
  const [charts, setCharts] = useState<{
    predictionsOverTime: AiChartDataPoint[];
    averageConfidence: AiChartDataPoint[];
    responseTime: AiChartDataPoint[];
    successRate: AiChartDataPoint[];
    errorRate: AiChartDataPoint[];
    predictionsPerMinute: AiChartDataPoint[];
    inferenceLatency: AiChartDataPoint[];
  } | null>(null);
  const [actions, setActions] = useState<AiServiceAction[]>([]);
  const [actionResult, setActionResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [showModelInfo, setShowModelInfo] = useState(true);
  const limit = 15;

  const loadAll = useCallback(async () => {
    try {
      const [h, m, met, pred, err, ch, act] = await Promise.all([
        adminAiApi.getSystemHealth(),
        adminAiApi.getModelInfo(),
        adminAiApi.getRealtimeMetrics(),
        adminAiApi.getPredictionHistory(predictionPage, limit, predSearch, predSort, predSortDir),
        adminAiApi.getErrorLogs(),
        adminAiApi.getCharts(),
        adminAiApi.getServiceActions(),
      ]);
      setHealth(h); setModel(m); setMetrics(met);
      setPredictions(pred.data); setPredictionTotal(pred.total);
      setErrors(err); setCharts(ch); setActions(act);
      setError(null);
    } catch { setError('Failed to load AI monitoring data'); }
    finally { setLoading(false); }
  }, [predictionPage, predSearch, predSort, predSortDir]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Auto-refresh every 30s (paused when tab hidden)
  const refreshRef = useRef(loadAll);
  refreshRef.current = loadAll;
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) refreshRef.current();
    }, 30_000);
    const onVis = () => { if (!document.hidden) refreshRef.current(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPredictionPage(1);
    loadAll();
  };

  const handleSort = (field: 'timestamp' | 'confidence' | 'latencyMs') => {
    if (predSort === field) setPredSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setPredSort(field); setPredSortDir('desc'); }
    setPredictionPage(1);
  };

  const handleAction = async (id: string) => {
    setActionResult(null);
    const result = await adminAiApi.executeAction(id);
    setActionResult({ id, ...result });
    setTimeout(() => setActionResult(null), 4000);
  };

  const handleDismissError = async (id: string) => {
    await adminAiApi.dismissError(id);
    setErrors((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'resolved' as const } : e)));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32" role="status" aria-label="Loading AI monitoring data">
        <Loader2 size={40} className="text-[#E9A8C9] animate-spin mb-4" />
        <p className="text-[#1A1A1A]/60 text-sm">Loading AI monitoring data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl p-8 text-center" role="alert">
        <AlertTriangle size={40} className="mx-auto text-[#F87171] mb-4" />
        <p className="text-[#1A1A1A] font-medium mb-2">{error}</p>
        <button onClick={loadAll} className="text-sm text-[#E9A8C9] hover:text-[#d490ab] underline">
          Try Again
        </button>
      </div>
    );
  }

  const summaryCards = metrics && health ? [
    { label: 'AI Service', icon: <BrainCircuit size={20} />, value: health.aiService.status.toUpperCase(), color: statusColor(health.aiService.status), bg: statusBg(health.aiService.status), sub: `${health.aiService.latency}ms latency` },
    { label: 'Backend Status', icon: <Server size={20} />, value: health.backend.status.toUpperCase(), color: statusColor(health.backend.status), bg: statusBg(health.backend.status), sub: `${health.backend.latency}ms` },
    { label: 'Database', icon: <Database size={20} />, value: health.database.status.toUpperCase(), color: statusColor(health.database.status), bg: statusBg(health.database.status), sub: 'PostgreSQL' },
    { label: 'Model Loaded', icon: <Layers size={20} />, value: model?.modelName ?? 'N/A', color: statusColor(health.model.status), bg: statusBg(health.model.status), sub: `v${model?.modelVersion ?? '?'}` },
    { label: 'Predictions Today', icon: <TrendingUp size={20} />, value: metrics.predictionsToday.toLocaleString(), color: 'text-[#B8E6C3]', bg: 'bg-[#B8E6C3]/10 border-[#B8E6C3]/20', sub: `${metrics.throughputPerMinute}/min` },
    { label: 'Translations Today', icon: <Activity size={20} />, value: metrics.translationsToday.toLocaleString(), color: 'text-[#A9D6F5]', bg: 'bg-[#A9D6F5]/10 border-[#A9D6F5]/20', sub: 'Sign → Text' },
    { label: 'Avg Confidence', icon: <Gauge size={20} />, value: `${(metrics.averageConfidence * 100).toFixed(1)}%`, color: 'text-[#F6D365]', bg: 'bg-[#F6D365]/10 border-[#F6D365]/20', sub: 'Model confidence' },
    { label: 'Avg Response Time', icon: <Clock size={20} />, value: `${metrics.averageLatency.toFixed(0)}ms`, color: 'text-[#F7C873]', bg: 'bg-[#F7C873]/10 border-[#F7C873]/20', sub: 'Inference latency' },
    { label: 'Failed Predictions', icon: <AlertCircle size={20} />, value: metrics.failedRequests.toString(), color: 'text-[#F87171]', bg: 'bg-[#F87171]/10 border-[#F87171]/20', sub: 'Last 24h' },
    { label: 'Success Rate', icon: <CheckCircle size={20} />, value: `${((1 - metrics.failedRequests / Math.max(1, metrics.inferenceCount)) * 100).toFixed(1)}%`, color: 'text-[#B8E6C3]', bg: 'bg-[#B8E6C3]/10 border-[#B8E6C3]/20', sub: 'Overall' },
    { label: 'GPU', icon: <Cpu size={20} />, value: health.gpu.available ? 'Active' : 'N/A', color: statusColor(health.gpu.status), bg: statusBg(health.gpu.status), sub: 'Inference device' },
    { label: 'Uptime', icon: <Shield size={20} />, value: metrics.uptime, color: 'text-[#A9D6F5]', bg: 'bg-[#A9D6F5]/10 border-[#A9D6F5]/20', sub: health.demoMode ? 'Demo mode' : 'Production' },
  ] : [];

  const healthItems = health ? [
    { label: 'AI Service', icon: <BrainCircuit size={16} />, key: 'aiService', ...health.aiService },
    { label: 'Backend', icon: <Server size={16} />, key: 'backend', ...health.backend },
    { label: 'Database', icon: <Database size={16} />, key: 'database', ...health.database },
    { label: 'Storage', icon: <HardDrive size={16} />, key: 'storage', ...health.storage },
    { label: 'Memory', icon: <Monitor size={16} />, key: 'memory', ...health.memory },
    { label: 'CPU', icon: <Cpu size={16} />, key: 'cpu', ...health.cpu },
    { label: 'GPU', icon: <Zap size={16} />, key: 'gpu', ...health.gpu },
    { label: 'Network', icon: <Wifi size={16} />, key: 'network', ...health.network },
  ] : [];

  const modelInfoItems = model ? [
    { label: 'Model Name', value: model.modelName },
    { label: 'Checkpoint', value: model.checkpoint.split('/').pop()! },
    { label: 'Version', value: model.modelVersion },
    { label: 'Framework', value: model.framework },
    { label: 'PyTorch Version', value: model.pytorchVersion },
    { label: 'MediaPipe Version', value: model.mediapipeVersion },
    { label: 'Inference Device', value: model.inferenceDevice },
    { label: 'Vocab Size', value: model.vocabSize.toLocaleString() },
    { label: 'd_model', value: String(model.dModel) },
    { label: 'Num Heads', value: String(model.numHeads) },
    { label: 'Encoder Layers', value: String(model.numEncoderLayers) },
    { label: 'Decoder Layers', value: String(model.numDecoderLayers) },
    { label: 'Parameters', value: model.numParameters.toLocaleString() },
    { label: 'Max Seq Length', value: String(model.maxSeqLength) },
    { label: 'Landmarks', value: String(model.numLandmarks) },
    { label: 'Features', value: String(model.numFeatures) },
    { label: 'Loaded At', value: new Date(model.loadedAt).toLocaleTimeString() },
    { label: 'Last Updated', value: new Date(model.lastUpdated).toLocaleDateString() },
    { label: 'Model Size', value: `${model.modelSizeMb} MB` },
    { label: 'Confidence Threshold', value: model.confidenceThreshold.toString() },
    { label: 'Prediction Timeout', value: `${model.predictionTimeout}s` },
    { label: 'Inference Mode', value: model.inferenceMode },
  ] : [];

  const paginationTotalPages = Math.ceil(predictionTotal / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">AI Monitoring</h1>
          <p className="text-sm text-[#1A1A1A]/60 mt-1">
            Real-time monitoring of AI inference service and model performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBg(health?.overallStatus ?? 'warning')} ${statusColor(health?.overallStatus ?? 'warning')} border`}>
            {statusIcon(health?.overallStatus ?? 'warning')}
            <span className="ml-1">{health?.overallStatus.toUpperCase()}</span>
          </span>
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#111] text-white rounded-lg text-sm hover:bg-[#111]/80 transition-colors"
            aria-label="Refresh AI monitoring data"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-3 rounded-[10px] border ${c.bg} flex flex-col gap-1`}
          >
            <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/50">
              <span className={c.color}>{c.icon}</span>{c.label}
            </div>
            <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
            <div className="text-[10px] text-[#1A1A1A]/40">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* System Health */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-[10px] border border-[#EFEFEF] p-5"
      >
        <h2 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-4">
          <Activity size={16} /> System Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="list" aria-label="System health status">
          {healthItems.map((item) => (
            <div key={item.key} className={`p-3 rounded-[10px] border ${statusBg(item.status)}`} role="listitem">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-medium text-[#1A1A1A]">
                  <span className={statusColor(item.status)}>{item.icon}</span>{item.label}
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-medium ${statusColor(item.status)}`}>
                  {statusIcon(item.status)}{item.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-[#1A1A1A]/40">
                <span>{item.key === 'gpu' ? (health?.gpu.available ? 'Active' : 'N/A') : `${item.latency}ms`}</span>
                <span>Updated {new Date(item.lastCheck).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts Grid — 7 charts using reusable components */}
      {charts && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Row 1: 3 charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ChartCard title="Predictions Over Time" icon={BarChart3} className="min-h-[220px]">
              <BarChart data={charts.predictionsOverTime} color="#B8E6C3" height={180} />
            </ChartCard>
            <ChartCard title="Average Confidence" icon={Gauge} className="min-h-[220px]">
              <BarChart data={charts.averageConfidence.map((d) => ({ label: d.label, value: d.value * 100 }))} color="#F6D365" height={180} />
            </ChartCard>
            <ChartCard title="Response Time" icon={Clock} className="min-h-[220px]">
              <LineChartComponent data={charts.responseTime} color="#A9D6F5" height={180} />
            </ChartCard>
          </div>
          {/* Row 2: 2 charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Success Rate" icon={CheckCircle} className="min-h-[220px]">
              <BarChart data={charts.successRate} color="#B8E6C3" height={180} />
            </ChartCard>
            <ChartCard title="Error Rate" icon={AlertCircle} className="min-h-[220px]">
              <BarChart data={charts.errorRate} color="#F87171" height={180} />
            </ChartCard>
          </div>
          {/* Row 3: 2 charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Predictions Per Minute" icon={ActivitySquare} className="min-h-[220px]">
              <LineChartComponent data={charts.predictionsPerMinute} color="#E9A8C9" height={180} />
            </ChartCard>
            <ChartCard title="Inference Latency" icon={Zap} className="min-h-[220px]">
              <LineChartComponent data={charts.inferenceLatency} color="#F7C873" height={180} />
            </ChartCard>
          </div>
        </motion.div>
      )}

      {/* Model Info + Service Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Model Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-white rounded-[10px] border border-[#EFEFEF] p-5"
        >
          <button
            onClick={() => setShowModelInfo(!showModelInfo)}
            className="flex items-center justify-between w-full text-sm font-semibold text-[#1A1A1A] mb-3"
            aria-expanded={showModelInfo}
          >
            <span className="flex items-center gap-2"><Layers size={16} /> Model Information</span>
            {showModelInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <AnimatePresence>
            {showModelInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {modelInfoItems.map((item) => (
                    <div key={item.label} className="p-2.5 rounded-[10px] bg-neutral-50 border border-[#EFEFEF]">
                      <div className="text-[10px] text-[#1A1A1A]/40 mb-0.5">{item.label}</div>
                      <div className="text-xs font-medium text-[#1A1A1A] truncate" title={item.value}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Service Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-[10px] border border-[#EFEFEF] p-5"
        >
          <h2 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-3">
            <Shield size={16} /> Service Actions
          </h2>
          <div className="space-y-2" role="list" aria-label="Service actions">
            {actions.map((action) => {
              const icons: Record<string, React.ReactNode> = {
                reload: <RotateCcw size={14} />,
                restart: <PlayCircle size={14} />,
                'clear-cache': <Trash2 size={14} />,
                'download-logs': <Download size={14} />,
                retrain: <GraduationCap size={14} />,
                refresh: <RefreshCcw size={14} />,
              };
              const resultForThis = actionResult?.id === action.id ? actionResult : null;
              return (
                <div key={action.id} className="flex items-center gap-3 p-2.5 rounded-[10px] bg-neutral-50 border border-[#EFEFEF]">
                  <span className="text-[#1A1A1A]/40">{icons[action.id] ?? <Zap size={14} />}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#1A1A1A]">{action.name}</div>
                    <div className="text-[10px] text-[#1A1A1A]/40 truncate">{action.description}</div>
                    {resultForThis && (
                      <div className={`text-[10px] mt-1 font-medium ${resultForThis.success ? 'text-[#B8E6C3]' : 'text-[#F87171]'}`}>
                        {resultForThis.message}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAction(action.id)}
                    disabled={!action.available}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      action.available
                        ? 'bg-[#111] text-white hover:bg-[#111]/80'
                        : 'bg-[#EFEFEF] text-[#1A1A1A]/30 cursor-not-allowed'
                    }`}
                    aria-label={action.name}
                  >
                    {action.id === 'refresh' ? 'Refresh' : 'Execute'}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-[#EFEFEF] text-[10px] text-[#1A1A1A]/40">
            Actions requiring backend endpoints show as unavailable until implemented.
          </div>
        </motion.div>
      </div>

      {/* Prediction History Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="bg-white rounded-[10px] border border-[#EFEFEF] p-5"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
            <BarChart3 size={16} /> Prediction History
            <span className="text-[10px] text-[#1A1A1A]/40 font-normal ml-2">
              {predictionTotal} total records
            </span>
          </h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search predictions…"
              value={predSearch}
              onChange={(e) => setPredSearch(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#FAF8F6] border border-[#EFEFEF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E9A8C9]/50 w-48"
              aria-label="Search predictions"
            />
            <button type="submit" className="px-3 py-1.5 bg-[#111] text-white rounded-lg text-xs hover:bg-[#111]/80 transition-colors">
              <Search size={14} />
            </button>
          </form>
        </div>

        <div className="overflow-x-auto" role="region" aria-label="Prediction history table">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                {[
                  { key: 'timestamp', label: 'Time' },
                  { key: 'prediction', label: 'Prediction' },
                  { key: 'confidence', label: 'Confidence' },
                  { key: 'latencyMs', label: 'Latency' },
                  { key: 'processingTimeMs', label: 'Processing' },
                  { key: 'inputType', label: 'Input' },
                  { key: 'status', label: 'Status' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.key === 'timestamp' || col.key === 'confidence' || col.key === 'latencyMs' ? handleSort(col.key as 'timestamp' | 'confidence' | 'latencyMs') : undefined}
                    className={`text-left py-2 px-3 text-[#1A1A1A]/50 font-medium ${col.key === 'timestamp' || col.key === 'confidence' || col.key === 'latencyMs' ? 'cursor-pointer hover:text-[#1A1A1A]' : ''}`}
                    scope="col"
                  >
                    {col.label}
                    {predSort === col.key && (
                      <span className="ml-1">{predSortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.map((pred) => (
                <tr key={pred.id} className="border-b border-[#EFEFEF]/50 hover:bg-[#FAF8F6] transition-colors">
                  <td className="py-2 px-3 text-[#1A1A1A]/60">
                    {new Date(pred.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-medium text-[#1A1A1A]">{pred.prediction}</td>
                  <td className="py-2 px-3">
                    <span className={`font-medium ${
                      pred.confidence >= 0.8 ? 'text-[#B8E6C3]' : pred.confidence >= 0.5 ? 'text-[#F6D365]' : 'text-[#F87171]'
                    }`}>
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[#1A1A1A]/60">{pred.latencyMs.toFixed(0)}ms</td>
                  <td className="py-2 px-3 text-[#1A1A1A]/60">{pred.processingTimeMs.toFixed(0)}ms</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#A9D6F5]/10 text-[#A9D6F5] text-[10px] font-medium">
                      {pred.inputType}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      pred.status === 'success' ? 'bg-[#B8E6C3]/10 text-[#B8E6C3]' : 'bg-[#F87171]/10 text-[#F87171]'
                    }`}>
                      {pred.status}
                    </span>
                  </td>
                </tr>
              ))}
              {predictions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#1A1A1A]/30 text-xs">
                    No prediction records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginationTotalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EFEFEF]" role="navigation" aria-label="Prediction history pagination">
            <span className="text-[10px] text-[#1A1A1A]/40">
              Page {predictionPage} of {paginationTotalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPredictionPage((p) => Math.max(1, p - 1))}
                disabled={predictionPage <= 1}
                className="p-1.5 rounded-lg bg-[#FAF8F6] border border-[#EFEFEF] hover:bg-[#EFEFEF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPredictionPage((p) => Math.min(paginationTotalPages, p + 1))}
                disabled={predictionPage >= paginationTotalPages}
                className="p-1.5 rounded-lg bg-[#FAF8F6] border border-[#EFEFEF] hover:bg-[#EFEFEF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Error Logs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white rounded-[10px] border border-[#EFEFEF] p-5"
      >
        <h2 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2 mb-4">
          <AlertTriangle size={16} /> Error Logs
          <span className="text-[10px] text-[#1A1A1A]/40 font-normal ml-2">
            {errors.filter((e) => e.status !== 'resolved').length} open
          </span>
        </h2>
        <div className="space-y-2" role="list" aria-label="Error logs">
          {errors.length === 0 ? (
            <div className="text-center py-8 text-[#1A1A1A]/30 text-xs">No errors recorded</div>
          ) : (
            errors.map((err) => (
              <div key={err.id} className={`rounded-[10px] border ${severityColor(err.severity)} overflow-hidden`}>
                <button
                  onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
                  aria-expanded={expandedError === err.id}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${severityColor(err.severity)}`}>
                      {err.severity.toUpperCase()}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-[#1A1A1A]">{err.message}</div>
                      <div className="text-[10px] text-[#1A1A1A]/40">
                        {err.module} · {err.errorType} · {new Date(err.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {err.status !== 'resolved' && (
                      <span
                        onClick={(e) => { e.stopPropagation(); handleDismissError(err.id); }}
                        className="text-[10px] text-[#B8E6C3] hover:text-[#8cc99a] cursor-pointer underline"
                        role="button"
                      >
                        Dismiss
                      </span>
                    )}
                    {expandedError === err.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedError === err.id && err.stackTrace && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-current/10"
                    >
                      <pre className="p-3 text-[10px] text-[#1A1A1A]/60 font-mono whitespace-pre-wrap break-all bg-black/5">
                        {err.stackTrace}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Footer note */}
      <div className="text-center text-[10px] text-[#1A1A1A]/30 pb-4 flex items-center justify-center gap-1.5">
        <Info size={10} />
        Auto-refreshes every 30 seconds. All data is simulated in demo mode.
      </div>
    </div>
  );
}
