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
    learningApi.getMyEnrollments()
      .then(setEnrollments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonLoader key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Courses" description="Continue learning where you left off" />

      {enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Enroll in a course to start your ISL learning journey."
          action={
            <Link href="/learn" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Browse Courses
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link key={enrollment.id} href={`/learn/${enrollment.courseId}`} className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{enrollment.course.title}</h3>
                <DifficultyBadge difficulty={enrollment.course.difficulty} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  enrollment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {enrollment.status}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
