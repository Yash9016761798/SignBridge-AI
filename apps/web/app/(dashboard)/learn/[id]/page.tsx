'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, Clock, Users, BarChart, BookOpen, Lock } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import DifficultyBadge from '@/components/dictionary/DifficultyBadge';
import { learningApi } from '@/lib/learning-api';
import type { CourseDetail } from '@/types/learning';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    learningApi.getCourseById(id)
      .then((data) => { setCourse(data); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    learningApi.getMyEnrollments()
      .then((enrollments) => { setEnrolled(enrollments.some((e) => e.courseId === id)); })
      .catch(() => {});
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await learningApi.enrollInCourse(id);
      setEnrolled(true);
    } catch {
      // ignore
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-48" />
        <SkeletonLoader className="h-64 rounded-xl" />
        <SkeletonLoader className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <BookOpen className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Course not found</h2>
        <Link href="/learn" className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <DifficultyBadge difficulty={course.difficulty} />
            </div>
            {course.description && <p className="text-gray-600 leading-relaxed">{course.description}</p>}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><BarChart className="h-4 w-4" />{course.modules.length} modules</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{course.estimatedDuration ? `${course.estimatedDuration} min` : 'Self-paced'}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{course.enrollmentCount} enrolled</span>
            </div>
            <div className="flex gap-3">
              {enrolled ? (
                <Link href={`/learn/${id}/modules`} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700">
                  <Play className="h-4 w-4" /> Continue Learning
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
        {course.modules.length === 0 ? (
          <p className="text-sm text-gray-500">No modules added yet.</p>
        ) : (
          <div className="space-y-3">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{modIdx + 1}</span>
                  <h3 className="font-medium text-gray-900">{mod.title}</h3>
                  <span className="ml-auto text-xs text-gray-400">{mod.lessons.length} lessons</span>
                </div>
                {mod.lessons.length > 0 && (
                  <ul className="divide-y divide-gray-100">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link href={`/learn/${id}/lessons/${lesson.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                          <Play className="h-4 w-4 text-gray-400" />
                          <span className="flex-1 text-sm text-gray-700">{lesson.title}</span>
                          {lesson.duration && <span className="text-xs text-gray-400">{Math.ceil(lesson.duration / 60)}m</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {course.quizzes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
          <div className="space-y-2">
            {course.quizzes.map((quiz) => (
              <Link key={quiz.id} href={`/learn/${id}/quiz/${quiz.id}`} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors">
                <BarChart className="h-5 w-5 text-primary-500" />
                <span className="flex-1 text-sm font-medium text-gray-900">{quiz.title}</span>
                <span className="text-xs text-gray-400">{quiz.questions.length} questions</span>
                <span className="text-xs text-gray-400">Pass: {quiz.passingScore}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
