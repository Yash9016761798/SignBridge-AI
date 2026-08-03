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
        <StatCard title="Courses Enrolled" value="2" icon={BookOpen} variant="rose" />
        <StatCard
          title="Practice Sessions"
          value="12"
          icon={Video}
          change={33}
          changeLabel="this week"
          variant="yellow"
        />
        <StatCard
          title="Translations"
          value="47"
          icon={MessageSquare}
          change={21}
          changeLabel="today"
          variant="sky"
        />
        <StatCard title="Certificates" value="1" icon={Award} variant="mint" />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-[#111111] dark:text-white">
            Quick Actions
          </h3>
          <Link
            href="/learn"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#111111] hover:underline transition-all dark:text-gray-300"
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
            variant="rose"
          />
          <QuickActionCard
            title="Practice Signs"
            description="AI-powered practice session"
            icon={Video}
            href="/practice"
            variant="yellow"
          />
          <QuickActionCard
            title="Translate"
            description="Convert text to sign language"
            icon={MessageSquare}
            href="/translation"
            variant="sky"
          />
          <QuickActionCard
            title="Dictionary"
            description="Browse sign language words"
            icon={BookMarked}
            href="/dictionary"
            variant="mint"
          />
        </div>
      </motion.div>

      {/* Activity & Learning */}
      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Recent Activity" icon={Clock}>
          <div className="space-y-3">
            {[
              {
                text: 'Completed "Basic Greetings" lesson',
                time: '2 hours ago',
                icon: BookOpen,
                hex: '#B8E6C3',
              },
              {
                text: 'Practiced 15 sign language gestures',
                time: 'Yesterday',
                icon: Video,
                hex: '#A9D6F5',
              },
              {
                text: 'Translated "Hello, how are you?" to ISL',
                time: '2 days ago',
                icon: MessageSquare,
                hex: '#E9A8C9',
              },
              {
                text: 'Earned ISL Basics Certificate',
                time: '3 days ago',
                icon: Award,
                hex: '#F6D365',
              },
            ].map((activity, i) => (
              <div
                key={i}
                style={{ backgroundColor: activity.hex }}
                className="group flex items-center justify-between rounded-[20px] p-4 text-[#111111] shadow-sm border border-black/5 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white shadow-sm flex-shrink-0">
                    <activity.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-[#111111]">{activity.text}</p>
                    <p className="font-body text-xs text-[#111111]/70 font-semibold mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#111111]/15 px-3 py-1 text-2xs font-extrabold text-[#111111]">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Continue Learning" icon={BookOpen}>
          <div className="space-y-4">
            <div
              style={{ backgroundColor: '#A9D6F5' }}
              className="rounded-[24px] p-5 border border-black/5 text-[#111111] shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading text-base font-extrabold text-[#111111]">
                    ISL Fundamentals
                  </p>
                  <p className="font-body mt-0.5 text-xs text-[#111111]/80 font-semibold">
                    Module 2: Common Phrases
                  </p>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white transition-all hover:scale-105 shadow-md">
                  <Play className="h-4 w-4 ml-0.5 text-[#A9D6F5]" />
                </button>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111111]/80">Progress</span>
                  <span className="font-extrabold text-[#111111]">60%</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#111111]/15">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full bg-[#111111]"
                  />
                </div>
              </div>
            </div>

            <div
              style={{ backgroundColor: '#F6D365' }}
              className="rounded-[24px] p-5 border border-black/5 text-[#111111] shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading text-base font-extrabold text-[#111111]">
                    Numbers & Counting
                  </p>
                  <p className="font-body mt-0.5 text-xs text-[#111111]/80 font-semibold">
                    Module 1: Basic Numbers
                  </p>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white transition-all hover:scale-105 shadow-md">
                  <Play className="h-4 w-4 ml-0.5 text-[#F6D365]" />
                </button>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111111]/80">Progress</span>
                  <span className="font-extrabold text-[#111111]">30%</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#111111]/15">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '30%' }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
                    className="h-full rounded-full bg-[#111111]"
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
