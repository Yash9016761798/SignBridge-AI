'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  BookOpen,
  BookMarked,
  Brain,
  MessageSquare,
  Activity,
  ArrowRight,
  Clock,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Sparkles,
  Building2,
  School,
  Landmark,
  HeartHandshake,
  GraduationCap,
  Award,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

/* ============================================================================
   DATA CONFIGURATIONS & METRICS
   ============================================================================ */

// 6 Core KPI Cards with Permanent Category Colors
const KPI_CARDS = [
  {
    title: 'Total Users',
    value: '124,820',
    change: 18,
    changeLabel: 'vs last month',
    icon: Users,
    hex: '#E8A5C9', // Soft Rose Pink (Users)
    subtext: 'across 24 institutions',
  },
  {
    title: 'Daily Active Learners',
    value: '42,150',
    change: 24,
    changeLabel: 'vs last week',
    icon: UserCheck,
    hex: '#F6D365', // Pastel Yellow (Content)
    subtext: 'avg 42 mins/session',
  },
  {
    title: 'ISL Lessons Published',
    value: '1,856',
    change: 15,
    changeLabel: 'added today',
    icon: BookOpen,
    hex: '#B8E6C3', // Mint Green (Performance)
    subtext: 'from Basic to Medical',
  },
  {
    title: 'Daily Sign Translations',
    value: '148,920',
    change: 33,
    changeLabel: 'today',
    icon: MessageSquare,
    hex: '#A9D6F5', // Sky Blue (Translation)
    subtext: 'evaluated in real-time',
  },
  {
    title: 'AI Recognition Accuracy',
    value: '98.42%',
    change: 0.4,
    changeLabel: 'v3.4 model',
    icon: Brain,
    hex: '#D8B4F8', // Soft Purple (AI Engine)
    subtext: 'at 60 FPS video inference',
  },
  {
    title: 'Certificates Issued',
    value: '38,410',
    change: 12,
    changeLabel: 'this week',
    icon: Award,
    hex: '#E8A5C9', // Soft Rose (Credentials)
    subtext: 'blockchain verified',
  },
];

// Institutional Monitoring Table Data
const INSTITUTION_NODES = [
  {
    name: 'AIIMS New Delhi Emergency',
    type: 'Hospital',
    icon: Building2,
    location: 'New Delhi',
    dailyLearners: '4,280',
    dailyTranslations: '12,450',
    status: 'Healthy',
    aiHealth: '99.8%',
    network: 'Fiber 1 Gbps',
    lastSync: '2 mins ago',
    hex: '#E8A5C9',
  },
  {
    name: 'Kendriya Vidyalaya ISL Hub',
    type: 'School',
    icon: School,
    location: 'Mumbai',
    dailyLearners: '8,920',
    dailyTranslations: '24,180',
    status: 'Healthy',
    aiHealth: '99.4%',
    network: '5G Dedicated',
    lastSync: '1 min ago',
    hex: '#F6D365',
  },
  {
    name: 'Passport Seva Kendra Kiosk',
    type: 'Govt Office',
    icon: Landmark,
    location: 'Bengaluru',
    dailyLearners: '1,450',
    dailyTranslations: '8,920',
    status: 'Healthy',
    aiHealth: '98.9%',
    network: 'GovNet Secure',
    lastSync: '4 mins ago',
    hex: '#A9D6F5',
  },
  {
    name: 'State Bank of India Main Branch',
    type: 'Bank Kiosk',
    icon: Building2,
    location: 'Pune',
    dailyLearners: '2,110',
    dailyTranslations: '5,420',
    status: 'Maintenance',
    aiHealth: '96.2%',
    network: 'Broadband',
    lastSync: '12 mins ago',
    hex: '#F6D365',
  },
  {
    name: 'Deaf Enablers Society Hub',
    type: 'NGO Center',
    icon: HeartHandshake,
    location: 'Hyderabad',
    dailyLearners: '3,840',
    dailyTranslations: '14,200',
    status: 'Healthy',
    aiHealth: '99.9%',
    network: 'Fiber 500 Mbps',
    lastSync: 'Just now',
    hex: '#B8E6C3',
  },
  {
    name: 'National Institute for Speech & Hearing',
    type: 'University',
    icon: GraduationCap,
    location: 'Trivandrum',
    dailyLearners: '5,600',
    dailyTranslations: '18,900',
    status: 'Healthy',
    aiHealth: '99.7%',
    network: 'NKN Campus',
    lastSync: '3 mins ago',
    hex: '#D8B4F8',
  },
];

// System Infrastructure Health Services
const SYSTEM_SERVICES = [
  {
    name: 'FastAPI Inference Engine',
    status: 'Healthy',
    latency: '14.2 ms',
    response: '99.99%',
    hex: '#B8E6C3',
  },
  {
    name: 'PoseNet Model v3.4 Registry',
    status: 'Healthy',
    latency: '6.1 ms',
    response: '100%',
    hex: '#D8B4F8',
  },
  {
    name: 'Prisma PostgreSQL DB Cluster',
    status: 'Healthy',
    latency: '2.4 ms',
    response: '99.98%',
    hex: '#A9D6F5',
  },
  {
    name: 'Redis Cache & Session Queue',
    status: 'Healthy',
    latency: '0.8 ms',
    response: '100%',
    hex: '#B8E6C3',
  },
  {
    name: 'AWS Cloud Failover Cluster',
    status: 'Healthy',
    latency: '18.4 ms',
    response: '99.95%',
    hex: '#A9D6F5',
  },
  {
    name: 'WebGPU Edge Pipeline',
    status: 'Healthy',
    latency: '11.0 ms',
    response: '99.90%',
    hex: '#D8B4F8',
  },
];

// Priority Alerts Feed
const SYSTEM_ALERTS = [
  {
    id: 1,
    title: 'SBI Kiosk Pune Scheduled Maintenance',
    severity: 'Medium',
    time: '12 mins ago',
    category: 'Infrastructure',
    hex: '#F6D365',
  },
  {
    id: 2,
    title: 'Model Retraining Pipeline Batch #402 Finished',
    severity: 'Low',
    time: '45 mins ago',
    category: 'AI Engine',
    hex: '#B8E6C3',
  },
  {
    id: 3,
    title: 'AIIMS Emergency Kiosk Firmware v3.4.2 Pushed',
    severity: 'Low',
    time: '2 hours ago',
    category: 'Deployment',
    hex: '#A9D6F5',
  },
];

// Real-Time System Activity Feed
const RECENT_ACTIVITY = [
  {
    time: '09:42',
    text: 'New Hospital Node Registered: Fortis Healthcare Delhi',
    type: 'Hospital',
    hex: '#E8A5C9',
  },
  {
    time: '09:40',
    text: 'ISL-PoseNet Model Retrained on 12,000 new gesture clips',
    type: 'AI',
    hex: '#D8B4F8',
  },
  {
    time: '09:35',
    text: '312 Accredited ISL Certificates Issued to KV Students',
    type: 'Certificate',
    hex: '#B8E6C3',
  },
  {
    time: '09:22',
    text: 'Passport Seva Kendra Kiosk #14 Connected via 5G',
    type: 'Kiosk',
    hex: '#A9D6F5',
  },
  {
    time: '09:15',
    text: '1,248 New Learners Onboarded across 4 State Hubs',
    type: 'User',
    hex: '#F6D365',
  },
];

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 4000);
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ====================================================================
          1. EXECUTIVE OVERVIEW BANNER (National Control Center Header)
          ==================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background:
            'linear-gradient(135deg, rgba(232,165,201,0.25) 0%, rgba(246,211,101,0.20) 40%, rgba(169,214,245,0.25) 100%)',
        }}
        className="relative overflow-hidden rounded-[32px] p-6 lg:p-8 text-[#111111] border border-black/5 shadow-sm"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm mb-3">
                <span className="h-2 w-2 rounded-full bg-[#B8E6C3] animate-pulse" />
                <Sparkles className="h-3.5 w-3.5 text-[#F6D365]" />
                <span>National ISL Ecosystem Control Center</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight lg:text-4xl text-[#111111]">
                Good Morning, {user?.firstName || 'Administrator'} 👋
              </h1>
              <p className="font-body mt-1 text-sm lg:text-base text-gray-700 font-medium max-w-2xl">
                Monitoring 140 Hospitals, 220 Schools, 122 Government Offices, and 482 Smart Kiosks
                across India in real time.
              </p>
            </div>

            {/* Banner Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGenerateReport}
                className="flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3 text-xs font-extrabold text-white shadow-md hover:scale-105 transition-all"
              >
                <BarChart3 className="h-4 w-4 text-[#F6D365]" />
                <span>{reportGenerated ? 'Report Downloaded!' : 'Generate Report'}</span>
              </button>

              <Link
                href="/admin/ai"
                className="flex items-center gap-2 rounded-full bg-[#E8A5C9] border border-black/5 px-5 py-3 text-xs font-extrabold text-[#111111] shadow-sm hover:scale-105 transition-all"
              >
                <Brain className="h-4 w-4" />
                <span>Retrain AI</span>
              </Link>

              <Link
                href="/admin/ai"
                className="flex items-center gap-2 rounded-full bg-[#A9D6F5] border border-black/5 px-5 py-3 text-xs font-extrabold text-[#111111] shadow-sm hover:scale-105 transition-all"
              >
                <Activity className="h-4 w-4" />
                <span>Monitor AI</span>
              </Link>
            </div>
          </div>

          {/* Floating Infrastructure Metric Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-black/5">
            <div className="rounded-full bg-white/80 border border-black/5 px-4 py-1.5 text-xs font-bold text-[#111111] shadow-2xs">
              🏫 <strong>220</strong> Schools Online
            </div>
            <div className="rounded-full bg-white/80 border border-black/5 px-4 py-1.5 text-xs font-bold text-[#111111] shadow-2xs">
              🏥 <strong>140</strong> Hospitals Active
            </div>
            <div className="rounded-full bg-white/80 border border-black/5 px-4 py-1.5 text-xs font-bold text-[#111111] shadow-2xs">
              🏛️ <strong>122</strong> Govt Offices
            </div>
            <div className="rounded-full bg-white/80 border border-black/5 px-4 py-1.5 text-xs font-bold text-[#111111] shadow-2xs">
              🤖 <strong>482</strong> Smart Kiosks
            </div>
            <div className="rounded-full bg-[#B8E6C3]/60 border border-black/5 px-4 py-1.5 text-xs font-bold text-[#111111] shadow-2xs flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#111111]" /> System Uptime: 99.99%
            </div>
          </div>
        </div>
      </motion.div>

      {/* ====================================================================
          2. 6 KPI SPARKLINE CARDS (Category Colored)
          ==================================================================== */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-[#111111]">Platform Metrics</h2>
          <span className="text-xs font-bold text-gray-500">Updated 2 mins ago</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {KPI_CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              style={{ backgroundColor: card.hex }}
              className="group rounded-[24px] p-5 shadow-sm border border-black/5 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-control-inactive text-2xs font-extrabold uppercase tracking-wider text-[#111111]/80 truncate">
                    {card.title}
                  </p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#111111] text-white shadow-sm flex-shrink-0">
                    <card.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                </div>

                <p className="font-heading text-3xl font-extrabold tracking-tight text-[#111111] mt-3">
                  {card.value}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-2xs font-extrabold text-[#111111]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111111]/15 px-2 py-0.5">
                  <TrendingUp className="h-3 w-3" />+{card.change}%
                </span>
                <span className="text-[#111111]/70 font-semibold truncate ml-1">
                  {card.changeLabel}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          3. DEDICATED AI OPERATIONS & PERFORMANCE PANEL
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 rounded-[32px] bg-[#1B1B1D] p-6 lg:p-8 text-white shadow-2xl border border-white/10"
        >
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#D8B4F8] text-[#111111] font-extrabold shadow-md">
                <Brain className="h-6 w-6 text-[#111111]" />
              </div>
              <div>
                <h3 className="font-display text-xl font-extrabold text-white">
                  AI Model Operations & Inference Engine
                </h3>
                <p className="text-xs font-semibold text-gray-400">
                  Model Architecture: ISL-PoseNet v3.4 • MediaPipe 21 Landmark Tracker
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#B8E6C3]/20 text-[#B8E6C3] px-3 py-1 text-xs font-extrabold border border-[#B8E6C3]/30">
              ● Healthy — Zero Model Drift
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-[20px] bg-[#242427] p-4 border border-white/5">
              <p className="text-2xs font-extrabold uppercase text-gray-400">Inference Latency</p>
              <p className="font-heading text-2xl font-extrabold text-[#F6D365] mt-1">14.2 ms</p>
              <p className="text-[10px] text-gray-400 mt-1">WebAssembly + WebGPU</p>
            </div>
            <div className="rounded-[20px] bg-[#242427] p-4 border border-white/5">
              <p className="text-2xs font-extrabold uppercase text-gray-400">Model Accuracy</p>
              <p className="font-heading text-2xl font-extrabold text-[#B8E6C3] mt-1">98.42%</p>
              <p className="text-[10px] text-gray-400 mt-1">148K clips evaluated</p>
            </div>
            <div className="rounded-[20px] bg-[#242427] p-4 border border-white/5">
              <p className="text-2xs font-extrabold uppercase text-gray-400">Daily Predictions</p>
              <p className="font-heading text-2xl font-extrabold text-[#A9D6F5] mt-1">1.48M</p>
              <p className="text-[10px] text-gray-400 mt-1">60 FPS stream</p>
            </div>
            <div className="rounded-[20px] bg-[#242427] p-4 border border-white/5">
              <p className="text-2xs font-extrabold uppercase text-gray-400">GPU Resource</p>
              <p className="font-heading text-2xl font-extrabold text-[#E8A5C9] mt-1">42% Used</p>
              <p className="text-[10px] text-gray-400 mt-1">Cluster 8x A100</p>
            </div>
          </div>

          {/* System Resource Utilization Gauges */}
          <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-300">GPU Cluster Load (NVIDIA Tensor Core)</span>
                <span className="text-[#E8A5C9]">42% Utilization</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[#E8A5C9] rounded-full w-[42%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-300">Inference Worker Threads (FastAPI Async)</span>
                <span className="text-[#A9D6F5]">28% CPU Usage</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[#A9D6F5] rounded-full w-[28%]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-time System Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 rounded-[32px] bg-white p-6 shadow-sm border border-black/5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#111111]" />
                <h3 className="font-display text-lg font-extrabold text-[#111111]">
                  Real-Time Event Stream
                </h3>
              </div>
              <span className="rounded-full bg-[#111111] text-white px-2.5 py-0.5 text-2xs font-extrabold">
                Live Feed
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {RECENT_ACTIVITY.map((act, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: act.hex }}
                  className="rounded-[18px] p-3 text-[#111111] border border-black/5 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-md bg-[#111111] text-white px-2 py-0.5 text-[10px] font-extrabold">
                      {act.time}
                    </span>
                    <p className="text-xs font-bold truncate max-w-[200px]">{act.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/ai"
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#111111] text-white py-3 text-xs font-extrabold hover:bg-black transition-all"
          >
            <span>View Full Audit Logs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>

      {/* ====================================================================
          4. INSTITUTIONAL INFRASTRUCTURE MONITORING TABLE
          ==================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] bg-white p-6 lg:p-8 shadow-sm border border-black/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#A9D6F5]/40 px-3 py-1 text-2xs font-extrabold text-[#111111] mb-1">
              Infrastructure Operations
            </div>
            <h3 className="font-display text-2xl font-extrabold text-[#111111]">
              National Institution & Hub Monitoring
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#B8E6C3] px-3 py-1 text-xs font-bold text-[#111111]">
              6 Active Nodes
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-gray-400 uppercase tracking-wider text-[10px] font-extrabold">
                <th className="pb-3 px-2">Institution Name</th>
                <th className="pb-3 px-2">Type</th>
                <th className="pb-3 px-2">Location</th>
                <th className="pb-3 px-2">Daily Learners</th>
                <th className="pb-3 px-2">Daily Translations</th>
                <th className="pb-3 px-2">AI Health</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {INSTITUTION_NODES.map((node, i) => (
                <tr key={i} className="hover:bg-[#FAF8F6] transition-colors">
                  <td className="py-4 px-2 font-extrabold text-[#111111] flex items-center gap-2.5">
                    <div
                      style={{ backgroundColor: node.hex }}
                      className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#111111] shadow-2xs"
                    >
                      <node.icon className="h-4 w-4" />
                    </div>
                    <span>{node.name}</span>
                  </td>
                  <td className="py-4 px-2 font-bold text-gray-700">{node.type}</td>
                  <td className="py-4 px-2 font-bold text-gray-600">{node.location}</td>
                  <td className="py-4 px-2 font-extrabold text-[#111111]">{node.dailyLearners}</td>
                  <td className="py-4 px-2 font-extrabold text-[#111111]">
                    {node.dailyTranslations}
                  </td>
                  <td className="py-4 px-2 font-extrabold text-[#111111]">{node.aiHealth}</td>
                  <td className="py-4 px-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-extrabold ${
                        node.status === 'Healthy'
                          ? 'bg-[#B8E6C3] text-[#111111]'
                          : 'bg-[#F6D365] text-[#111111]'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#111111]" />
                      {node.status}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button className="rounded-full bg-[#111111] text-white px-3 py-1 text-2xs font-extrabold hover:bg-black transition-all">
                      Inspect Node
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ====================================================================
          5. SYSTEM HEALTH & PRIORITY ALERTS
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Services Grid */}
        <div className="lg:col-span-8 rounded-[32px] bg-white p-6 lg:p-8 shadow-sm border border-black/5">
          <div className="flex items-center justify-between pb-6 border-b border-black/5">
            <h3 className="font-display text-xl font-extrabold text-[#111111]">
              System Health & Service Monitoring
            </h3>
            <span className="text-xs font-bold text-gray-500">6/6 Services Operational</span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SYSTEM_SERVICES.map((srv, i) => (
              <div
                key={i}
                style={{ backgroundColor: srv.hex }}
                className="rounded-[20px] p-4 text-[#111111] border border-black/5 flex flex-col justify-between shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-extrabold text-[#111111] truncate">
                    {srv.name}
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-[#111111] flex-shrink-0" />
                </div>
                <div className="mt-3 flex items-center justify-between text-2xs font-extrabold text-[#111111]">
                  <span>Latency: {srv.latency}</span>
                  <span>Uptime: {srv.response}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Alerts Panel */}
        <div className="lg:col-span-4 rounded-[32px] bg-white p-6 shadow-sm border border-black/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#111111]" />
                <h3 className="font-display text-lg font-extrabold text-[#111111]">
                  Priority System Alerts
                </h3>
              </div>
              <span className="rounded-full bg-[#F6D365] text-[#111111] px-2.5 py-0.5 text-2xs font-extrabold">
                3 Active
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {SYSTEM_ALERTS.map((alert) => (
                <div
                  key={alert.id}
                  style={{ backgroundColor: alert.hex }}
                  className="rounded-[18px] p-3 text-[#111111] border border-black/5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-extrabold text-[#111111]">
                      {alert.title}
                    </span>
                    <span className="rounded-full bg-[#111111] text-white px-2 py-0.5 text-[9px] font-extrabold">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-[#111111]/70 mt-1">
                    {alert.time} • {alert.category}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button className="mt-6 w-full rounded-full bg-[#111111] text-white py-3 text-xs font-extrabold hover:bg-black transition-all">
            Dismiss Non-Critical Alerts
          </button>
        </div>
      </div>

      {/* ====================================================================
          6. RICH QUICK ACTION CARDS
          ==================================================================== */}
      <div>
        <h3 className="font-display text-xl font-extrabold text-[#111111] mb-4">
          Quick Command Center
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Manage Users',
              description: '124 Pending Approvals',
              icon: Users,
              href: '/admin/users',
              hex: '#E8A5C9',
            },
            {
              title: 'Manage Courses',
              description: '8 Curriculum Updates Ready',
              icon: BookOpen,
              href: '/admin/courses',
              hex: '#F6D365',
            },
            {
              title: 'AI Monitoring',
              description: 'PoseNet v3.4 Operational',
              icon: Brain,
              href: '/admin/ai',
              hex: '#D8B4F8',
            },
            {
              title: 'View Analytics',
              description: 'Generate Operations Report',
              icon: BarChart3,
              href: '/admin/analytics',
              hex: '#A9D6F5',
            },
          ].map((action, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} transition={{ duration: 0.3 }}>
              <Link
                href={action.href}
                style={{ backgroundColor: action.hex }}
                className="group flex items-center gap-4 rounded-[24px] p-5 shadow-sm border border-black/5 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#111111] text-white shadow-sm transition-transform group-hover:scale-105 flex-shrink-0">
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm font-extrabold text-[#111111]">
                    {action.title}
                  </h3>
                  <p className="font-body mt-0.5 text-xs text-[#111111]/80 font-medium">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#111111]/60 transition-all group-hover:translate-x-1 group-hover:text-[#111111]" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
