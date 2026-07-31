'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  Award,
  Brain,
  Zap,
  Download,
  ChevronDown,
  TrendingUp,
  Activity,
  Globe,
  Monitor,
  Target,
  FileText,
  Clock,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import BarChart from '@/components/admin/charts/BarChart';
import LineChart from '@/components/admin/charts/LineChart';
import DonutChart from '@/components/admin/charts/DonutChart';
import ChartCard from '@/components/admin/charts/ChartCard';
import { adminAnalyticsApi } from '@/lib/admin-analytics-api';
import type { AnalyticsDashboard, TimeRange, BreakdownItem, TopListItem } from '@/types/admin-analytics';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

function BreakdownLegend({ data }: { data: BreakdownItem[] }) {
  return (
    <div className="mt-3 space-y-1.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${d.color}`} />
            <span className="text-surface-600 dark:text-surface-400 truncate">{d.label}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-semibold text-surface-900 dark:text-white">{d.value.toLocaleString()}</span>
            <span className="text-2xs text-surface-400 w-10 text-right">{d.percent}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopList({ data, valueLabel = 'value' }: { data: TopListItem[]; valueLabel?: string }) {
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.rank} className="flex items-center gap-3 rounded-[12px] p-2 hover:bg-surface-50 dark:hover:bg-surface-800/50">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            {item.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{item.name}</p>
            {item.subtitle && <p className="text-2xs text-surface-400">{item.subtitle}</p>}
          </div>
          <span className="text-sm font-bold text-surface-900 dark:text-white flex-shrink-0">
            {item.value.toLocaleString()} {valueLabel !== 'value' ? valueLabel : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isVisible = useRef(true);

  const fetchData = useCallback(async () => {
    if (!isVisible.current) return;
    try {
      const dashboard = await adminAnalyticsApi.getDashboard(timeRange);
      setData(dashboard);
    } catch { /* ignore */ }
    setLoading(false);
  }, [timeRange]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  useEffect(() => {
    refreshTimer.current = setInterval(() => { if (isVisible.current) fetchData(); }, 60000);
    const onVis = () => { isVisible.current = !document.hidden; };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [fetchData]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowRangeDropdown(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Platform-wide performance and usage analytics"
        icon={BarChart3}
        action={
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowRangeDropdown(!showRangeDropdown)}
                className="flex min-h-[44px] items-center gap-2 rounded-[14px] border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:border-surface-300 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300"
              >
                <Clock className="h-4 w-4" />
                {TIME_RANGES.find((r) => r.value === timeRange)?.label}
                <ChevronDown className={`h-4 w-4 transition-transform ${showRangeDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showRangeDropdown && (
                <div className="absolute right-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-[16px] border border-surface-200 bg-white shadow-lg dark:border-surface-700 dark:bg-surface-900">
                  <div className="py-1">
                    {TIME_RANGES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => { setTimeRange(r.value); setShowRangeDropdown(false); }}
                        className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${timeRange === r.value ? 'bg-surface-50 font-semibold dark:bg-surface-800' : 'hover:bg-surface-50 dark:hover:bg-surface-800'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Export Button (disabled) */}
            <button
              disabled
              className="flex min-h-[44px] items-center gap-2 rounded-[14px] border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-400 cursor-not-allowed dark:border-surface-700 dark:bg-surface-900"
              title="Export requires backend endpoints"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button onClick={() => fetchData()} className="btn-secondary inline-flex items-center gap-2 text-sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        }
      />

      {loading || !data ? (
        <SkeletonLoader count={4} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={data.summary.totalUsers} icon={Users} change={data.summary.userGrowthPercent} />
            <StatCard title="Active Users" value={data.summary.activeUsers} icon={Activity} />
            <StatCard title="Courses" value={data.summary.totalCourses} icon={BookOpen} change={data.summary.courseEnrollmentPercent} />
            <StatCard title="Certificates" value={data.summary.totalCertificates} icon={Award} />
            <StatCard title="Dictionary Signs" value={data.summary.totalSigns} icon={FileText} />
            <StatCard title="AI Predictions" value={data.summary.totalPredictions} icon={Brain} change={data.summary.predictionGrowthPercent} />
            <StatCard title="Translations" value={data.summary.totalTranslations} icon={Globe} />
            <StatCard title="Completion Rate" value={`${data.summary.completionRate}%`} icon={Target} />
          </div>

          {/* Charts Row 1: User Growth + Daily Active Users */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="User Growth" icon={TrendingUp}>
              <LineChart data={data.userGrowth} height={200} />
            </ChartCard>
            <ChartCard title="Daily Active Users" icon={Activity}>
              <BarChart data={data.dailyActiveUsers} height={200} color="bg-info-500" />
            </ChartCard>
          </div>

          {/* Charts Row 2: Course Completion + Learning Progress */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Course Completion" icon={Award}>
              <LineChart data={data.courseCompletion} height={200} color="stroke-success-500" fillColor="fill-success-500/10" />
            </ChartCard>
            <ChartCard title="Learning Progress" icon={BookOpen}>
              <LineChart data={data.learningProgress} height={200} color="stroke-secondary-500" fillColor="fill-secondary-500/10" />
            </ChartCard>
          </div>

          {/* Charts Row 3: Dictionary + Predictions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Dictionary Usage" icon={FileText}>
              <BarChart data={data.dictionaryUsage} height={200} color="bg-warning-500" />
            </ChartCard>
            <ChartCard title="Prediction Volume" icon={Zap}>
              <BarChart data={data.predictionVolume} height={200} color="bg-primary-500" />
            </ChartCard>
          </div>

          {/* Charts Row 4: Translation + Quiz + Certificates */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ChartCard title="Translation Volume" icon={Globe}>
              <LineChart data={data.translationVolume} height={180} color="stroke-sky-500" fillColor="fill-sky-500/10" />
            </ChartCard>
            <ChartCard title="Quiz Success Rate" icon={Target}>
              <LineChart data={data.quizSuccessRate} height={180} color="stroke-success-500" fillColor="fill-success-500/10" />
            </ChartCard>
            <ChartCard title="Certificate Issuance" icon={Award}>
              <BarChart data={data.certificateIssuance} height={180} color="bg-success-500" />
            </ChartCard>
          </div>

          {/* Breakdowns Row */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ChartCard title="Users by Role" icon={Users}>
              <div className="flex justify-center mb-2">
                <DonutChart data={data.usersByRole} centerValue={data.summary.totalUsers} centerLabel="users" />
              </div>
              <BreakdownLegend data={data.usersByRole} />
            </ChartCard>
            <ChartCard title="Users by Country" icon={Globe}>
              <div className="flex justify-center mb-2">
                <DonutChart data={data.usersByCountry} centerValue={data.usersByCountry.length} centerLabel="countries" />
              </div>
              <BreakdownLegend data={data.usersByCountry} />
            </ChartCard>
            <ChartCard title="Users by Device" icon={Monitor}>
              <div className="flex justify-center mb-2">
                <DonutChart data={data.usersByDevice} centerValue="3" centerLabel="platforms" />
              </div>
              <BreakdownLegend data={data.usersByDevice} />
            </ChartCard>
            <ChartCard title="Predictions by Gesture" icon={Zap}>
              <div className="flex justify-center mb-2">
                <DonutChart data={data.predictionsByGesture} centerValue={data.summary.totalPredictions} centerLabel="total" />
              </div>
              <BreakdownLegend data={data.predictionsByGesture} />
            </ChartCard>
          </div>

          {/* Course + Dictionary Breakdowns */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ChartCard title="Courses by Category" icon={BookOpen}>
              <BreakdownLegend data={data.coursesByCategory} />
            </ChartCard>
            <ChartCard title="Courses by Difficulty" icon={Target}>
              <div className="flex justify-center mb-3">
                <DonutChart data={data.coursesByDifficulty} centerValue={data.summary.totalCourses} centerLabel="courses" />
              </div>
              <BreakdownLegend data={data.coursesByDifficulty} />
            </ChartCard>
            <ChartCard title="Dictionary by Category" icon={FileText}>
              <BreakdownLegend data={data.dictionaryByCategory} />
            </ChartCard>
          </div>

          {/* Top Lists */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ChartCard title="Top Courses" icon={BookOpen} action={<span className="text-2xs text-surface-400">by enrollment</span>}>
              <TopList data={data.topCourses} valueLabel="enrolled" />
            </ChartCard>
            <ChartCard title="Top Signs" icon={FileText} action={<span className="text-2xs text-surface-400">by usage</span>}>
              <TopList data={data.topSigns} valueLabel="uses" />
            </ChartCard>
            <ChartCard title="Top Learners" icon={Users} action={<span className="text-2xs text-surface-400">by score</span>}>
              <TopList data={data.topLearners} valueLabel="score" />
            </ChartCard>
            <ChartCard title="Most Active Users" icon={Activity} action={<span className="text-2xs text-surface-400">this month</span>}>
              <TopList data={data.mostActiveUsers} valueLabel="sessions" />
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
