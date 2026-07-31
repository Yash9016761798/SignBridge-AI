'use client';

import { useAuthStore } from '@/stores/auth-store';
import StatCard from '@/components/dashboard/StatCard';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { motion } from 'framer-motion';
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
  UserX,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const recentActivity = [
  {
    text: 'New user registered: Priya Sharma',
    time: '5 minutes ago',
    icon: Users,
    color: 'bg-success-50 text-success-500',
  },
  {
    text: 'Course "ISL Advanced" published',
    time: '1 hour ago',
    icon: BookOpen,
    color: 'bg-info-50 text-info-600',
  },
  {
    text: 'AI model updated to v2.1.0',
    time: '3 hours ago',
    icon: Brain,
    color: 'bg-warning-50 text-warning-600',
  },
  {
    text: '15 new dictionary signs added',
    time: 'Yesterday',
    icon: BookMarked,
    color: 'bg-primary-50 text-primary-600',
  },
  {
    text: 'System backup completed',
    time: 'Yesterday',
    icon: CheckCircle,
    color: 'bg-success-50 text-success-500',
  },
];

const recentUsers = [
  { name: 'Priya Sharma', email: 'priya@example.com', role: 'LEARNER', status: 'active', joined: '2 hours ago' },
  { name: 'Rahul Patel', email: 'rahul@example.com', role: 'TEACHER', status: 'active', joined: '5 hours ago' },
  { name: 'Anita Desai', email: 'anita@example.com', role: 'LEARNER', status: 'pending', joined: '1 day ago' },
  { name: 'Vikram Singh', email: 'vikram@example.com', role: 'INSTRUCTOR', status: 'active', joined: '2 days ago' },
];

const systemStatus = [
  { name: 'API Server', status: 'operational', uptime: '99.9%' },
  { name: 'AI Service', status: 'operational', uptime: '99.7%' },
  { name: 'Database', status: 'operational', uptime: '100%' },
  { name: 'Storage', status: 'warning', uptime: '78% used' },
];

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Header */}
      <motion.div variants={item}>
        <div className="rounded-card bg-gradient-to-br from-surface-900 to-surface-800 p-6 text-white shadow-elevated lg:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-surface-300 lg:text-lg">
                Welcome back, {user?.firstName || 'Admin'}. Here&apos;s what&apos;s happening.
              </p>
            </div>
            <div className="hidden rounded-[16px] bg-white/10 p-3 backdrop-blur-sm lg:block">
              <Activity className="h-6 w-6 text-primary-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Users" value="1,247" icon={Users} change={12} changeLabel="this month" />
        <StatCard title="Active Users" value="892" icon={UserCheck} change={8} changeLabel="this week" />
        <StatCard title="Courses" value="24" icon={BookOpen} change={4} changeLabel="new" />
        <StatCard title="Dictionary Signs" value="1,856" icon={BookMarked} change={15} changeLabel="added" />
        <StatCard title="Predictions Today" value="3,421" icon={Brain} change={23} changeLabel="vs yesterday" />
        <StatCard title="Translations Today" value="5,678" icon={MessageSquare} change={18} changeLabel="vs yesterday" />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-surface-900 dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Manage Users', description: 'View and manage all users', icon: Users, href: '/admin/users' },
            { title: 'Manage Courses', description: 'Create and edit courses', icon: BookOpen, href: '/admin/courses' },
            { title: 'AI Monitoring', description: 'Monitor AI service health', icon: Brain, href: '/admin/ai' },
            { title: 'View Analytics', description: 'Platform usage analytics', icon: BarChart3, href: '/admin/analytics' },
          ].map((action) => (
            <motion.div key={action.href} whileHover={{ y: -3 }} transition={{ duration: 0.3 }}>
              <Link
                href={action.href}
                className="group flex items-center gap-4 rounded-card bg-white p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary-200 border border-transparent dark:bg-surface-900 dark:hover:border-primary-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-brand-soft transition-colors group-hover:bg-gradient-brand-medium">
                  <action.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-surface-900 dark:text-white">{action.title}</h3>
                  <p className="mt-0.5 text-xs text-surface-500">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-surface-300 transition-all group-hover:translate-x-1 group-hover:text-primary-500" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity, Users, Status */}
      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <DashboardCard title="Recent Activity" icon={Clock} className="lg:col-span-1">
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="group flex items-center gap-4 rounded-[16px] p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${activity.color}`}
                >
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    {activity.text}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Recent Users */}
        <DashboardCard title="Recent Users" icon={Users} className="lg:col-span-1">
          <div className="space-y-3">
            {recentUsers.map((u, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-[16px] p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
                  <span className="text-sm font-semibold text-surface-600 dark:text-surface-400">
                    {u.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-surface-500 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-bold ${
                      u.role === 'TEACHER' || u.role === 'INSTRUCTOR'
                        ? 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-500'
                        : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400'
                    }`}
                  >
                    {u.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold ${
                      u.status === 'active'
                        ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500'
                        : 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-600'
                    }`}
                  >
                    {u.status === 'active' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertTriangle className="h-3 w-3" />
                    )}
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* System Status */}
        <DashboardCard title="System Status" icon={Activity} className="lg:col-span-1">
          <div className="space-y-3">
            {systemStatus.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-[16px] p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      s.status === 'operational'
                        ? 'bg-success-500'
                        : s.status === 'warning'
                        ? 'bg-warning-500'
                        : 'bg-danger-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{s.name}</span>
                </div>
                <span
                  className={`text-xs font-semibold ${
                    s.status === 'operational'
                      ? 'text-success-600 dark:text-success-500'
                      : s.status === 'warning'
                      ? 'text-warning-600 dark:text-warning-500'
                      : 'text-danger-600 dark:text-danger-500'
                  }`}
                >
                  {s.uptime}
                </span>
              </div>
            ))}
            <Link
              href="/admin/settings"
              className="mt-2 flex items-center justify-center gap-2 rounded-[12px] border border-surface-200 px-4 py-2.5 text-sm font-medium text-surface-700 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
            >
              <Settings className="h-4 w-4" />
              System Settings
            </Link>
          </div>
        </DashboardCard>
      </motion.div>
    </motion.div>
  );
}
