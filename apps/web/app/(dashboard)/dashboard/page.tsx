'use client';

import { useAuthStore } from '@/stores/auth-store';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import StatCard from '@/components/dashboard/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Video,
  MessageSquare,
  BookMarked,
  Award,
  Clock,
  ArrowRight,
  Play,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  const firstName = user?.firstName || 'User';
  const role = user?.role || 'LEARNER';
  const organization = user?.organizationId || undefined;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Banner */}
      <motion.div variants={item}>
        <WelcomeBanner
          firstName={firstName}
          role={role}
          organization={organization}
          lastLogin={new Date().toLocaleDateString()}
        />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Courses Enrolled" value="2" icon={BookOpen} />
        <StatCard
          title="Practice Sessions"
          value="12"
          icon={Video}
          change={33}
          changeLabel="this week"
        />
        <StatCard
          title="Translations"
          value="47"
          icon={MessageSquare}
          change={21}
          changeLabel="today"
        />
        <StatCard title="Certificates" value="1" icon={Award} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Quick Actions</h3>
          <Link
            href="/learn"
            className="flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            title="Start Learning"
            description="Begin a new ISL lesson"
            icon={BookOpen}
            href="/learn"
          />
          <QuickActionCard
            title="Practice Signs"
            description="AI-powered practice session"
            icon={Video}
            href="/practice"
          />
          <QuickActionCard
            title="Translate"
            description="Convert text to sign language"
            icon={MessageSquare}
            href="/translation"
          />
          <QuickActionCard
            title="Dictionary"
            description="Browse sign language words"
            icon={BookMarked}
            href="/dictionary"
          />
        </div>
      </motion.div>

      {/* Activity & Learning */}
      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Recent Activity" icon={Clock}>
          <div className="space-y-4">
            {[
              {
                text: 'Completed "Basic Greetings" lesson',
                time: '2 hours ago',
                icon: BookOpen,
                color: 'text-accent-500 bg-accent-50 dark:bg-accent-500/10',
              },
              {
                text: 'Practiced 15 sign language gestures',
                time: 'Yesterday',
                icon: Video,
                color: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10',
              },
              {
                text: 'Translated "Hello, how are you?" to ISL',
                time: '2 days ago',
                icon: MessageSquare,
                color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-500/10',
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/50"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${activity.color}`}
                >
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {activity.text}
                  </p>
                  <p className="text-xs text-surface-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Continue Learning" icon={BookOpen}>
          <div className="space-y-4">
            <div className="rounded-xl border border-surface-200 p-4 transition-colors hover:border-primary-200 dark:border-surface-700 dark:hover:border-primary-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    ISL Fundamentals
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500">Module 2: Common Phrases</p>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-500 transition-colors hover:bg-primary-100 dark:bg-primary-950/50">
                  <Play className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">Progress</span>
                  <span className="font-medium text-primary-500">60%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-surface-200 p-4 transition-colors hover:border-primary-200 dark:border-surface-700 dark:hover:border-primary-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    Numbers & Counting
                  </p>
                  <p className="mt-0.5 text-xs text-surface-500">Module 1: Basic Numbers</p>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-500 transition-colors hover:bg-primary-100 dark:bg-primary-950/50">
                  <Play className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-surface-500">Progress</span>
                  <span className="font-medium text-primary-500">30%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '30%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>
      </motion.div>
    </motion.div>
  );
}
