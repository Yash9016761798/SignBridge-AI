'use client';

import { useAuthStore } from '@/stores/auth-store';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import DashboardCard from '@/components/dashboard/DashboardCard';
import {
  BookOpen,
  Video,
  MessageSquare,
  BookMarked,
  Award,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const firstName = user?.firstName || 'User';
  const role = user?.role || 'LEARNER';
  const organization = user?.organizationId || undefined;

  return (
    <div className="space-y-6">
      <WelcomeBanner
        firstName={firstName}
        role={role}
        organization={organization}
        lastLogin={new Date().toLocaleDateString()}
      />

      <PageHeader
        title="Dashboard"
        description="Your personalized learning hub"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Courses Enrolled" value="2" icon={BookOpen} />
        <StatCard title="Practice Sessions" value="12" icon={Video} change={33} changeLabel="this week" />
        <StatCard title="Translations" value="47" icon={MessageSquare} change={21} changeLabel="today" />
        <StatCard title="Certificates" value="1" icon={Award} />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Recent Activity" icon={Clock}>
          <div className="space-y-3">
            {[
              { text: 'Completed "Basic Greetings" lesson', time: '2 hours ago' },
              { text: 'Practiced 15 sign language gestures', time: 'Yesterday' },
              { text: 'Translated "Hello, how are you?" to ISL', time: '2 days ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                <p className="text-sm text-gray-700">{activity.text}</p>
                <span className="whitespace-nowrap text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Continue Learning" icon={BookOpen}>
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-sm font-medium text-gray-900">ISL Fundamentals</p>
              <p className="text-xs text-gray-500">Module 2: Common Phrases</p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-3/5 rounded-full bg-primary-500" />
              </div>
              <p className="mt-1 text-xs text-gray-400">60% complete</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
