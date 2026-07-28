'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/dashboard/PageHeader';
import EmptyState from '@/components/dashboard/EmptyState';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import DifficultyBadge from '@/components/dictionary/DifficultyBadge';
import { learningApi } from '@/lib/learning-api';
import type { Enrollment } from '@/types/learning';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learningApi
      .getMyEnrollments()
      .then(setEnrollments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-48 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Continue learning where you left off"
        icon={BookOpen}
      />

      {enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Enroll in a course to start your ISL learning journey."
          accentColor="mint"
          action={
            <Link href="/learn" className="btn-mint text-sm">
              Browse Courses
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/learn/${enrollment.courseId}`}
              className="group rounded-card border border-surface-200 bg-white p-5 shadow-card transition-all hover:shadow-card-hover dark:border-surface-700 dark:bg-surface-900"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-surface-900 group-hover:text-success-600 transition-colors dark:text-white dark:group-hover:text-success-500">
                  {enrollment.course.title}
                </h3>
                <DifficultyBadge difficulty={enrollment.course.difficulty} />
              </div>
              <p className="mt-2 text-xs text-surface-500">
                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    enrollment.status === 'COMPLETED'
                      ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500'
                      : 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400'
                  }`}
                >
                  {enrollment.status}
                </span>
                <ArrowRight className="h-4 w-4 text-surface-400 group-hover:text-success-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
