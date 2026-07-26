'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, CheckCircle, Clock } from 'lucide-react';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { learningApi } from '@/lib/learning-api';
import type { LessonDetail } from '@/types/learning';

export default function LessonPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = use(params);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    learningApi.getLessonById(lessonId)
      .then(setLesson)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await learningApi.updateProgress({ lessonId, completed: true });
      setCompleted(true);
    } catch {
      // ignore
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-48" />
        <SkeletonLoader className="aspect-video rounded-xl" />
        <SkeletonLoader className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-xl font-semibold text-gray-900">Lesson not found</h2>
        <Link href={`/learn/${id}`} className="mt-6 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Back to Course
        </Link>
      </div>
    );
  }

  const courseTitle = lesson.module?.course?.title || 'Course';
  const courseSlug = lesson.module?.course?.id || id;

  return (
    <div className="space-y-6">
      <Link href={`/learn/${courseSlug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to {courseTitle}
      </Link>

      <div className="aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        {lesson.videoUrl ? (
          <button className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <Play className="h-10 w-10 text-white" />
          </button>
        ) : (
          <div className="text-center text-gray-400">
            <Play className="mx-auto h-16 w-16 opacity-50" />
            <p className="mt-2 text-sm">No video available</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400">{lesson.module?.title}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{lesson.title}</h1>
          </div>
          {lesson.duration && (
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />{Math.ceil(lesson.duration / 60)} min
            </span>
          )}
        </div>
        {lesson.description && <p className="mt-4 text-gray-600 leading-relaxed">{lesson.description}</p>}
        <div className="mt-6 flex gap-3">
          {completed ? (
            <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" /> Completed
            </span>
          ) : (
            <button onClick={handleComplete} disabled={completing} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {completing ? 'Saving...' : 'Mark as Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
