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
        <StatCard title="Courses Enrolled" value="0" icon={BookOpen} />
        <StatCard title="Practice Sessions" value="0" icon={Video} />
        <StatCard title="Translations" value="0" icon={MessageSquare} />
        <StatCard title="Certificates" value="0" icon={Award} />
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
          <p className="text-sm text-gray-500">No recent activity yet. Start learning to see your progress here.</p>
        </DashboardCard>

        <DashboardCard title="Continue Learning" icon={BookOpen}>
          <p className="text-sm text-gray-500">You haven&apos;t started any courses yet. Browse our catalog to get started.</p>
        </DashboardCard>
      </div>
    </div>
  );
}
