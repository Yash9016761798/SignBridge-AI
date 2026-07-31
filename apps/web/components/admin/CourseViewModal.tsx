'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Clock,
  Users,
  BarChart,
  Play,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Tag,
} from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import { adminCourseApi } from '@/lib/admin-course-api';
import type { AdminCourseDetail } from '@/types/admin-course';

interface CourseViewModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string | null;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  PUBLISHED: { color: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500', icon: CheckCircle2, label: 'Published' },
  DRAFT: { color: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500', icon: AlertTriangle, label: 'Draft' },
  ARCHIVED: { color: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400', icon: Archive, label: 'Archived' },
};

const difficultyColor: Record<string, string> = {
  BEGINNER: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  INTERMEDIATE: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
  ADVANCED: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
};

export default function CourseViewModal({ open, onClose, courseId }: CourseViewModalProps) {
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && courseId) {
      setLoading(true);
      adminCourseApi
        .getCourseById(courseId)
        .then(setCourse)
        .catch(() => setCourse(null))
        .finally(() => setLoading(false));
    } else {
      setCourse(null);
    }
  }, [open, courseId]);

  const totalLessons = course?.modules.reduce((sum, m) => sum + m.lessons.length, 0) || 0;
  const totalQuestions = course?.quizzes.reduce((sum, q) => sum + q.questions.length, 0) || 0;
  const StatusIcon = course ? statusConfig[course.status]?.icon || CheckCircle2 : CheckCircle2;

  return (
    <GenericModal open={open} onClose={onClose} title="Course Details" className="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : course ? (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start gap-3">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">{course.title}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusConfig[course.status]?.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig[course.status]?.label}
              </span>
            </div>
            {course.description && (
              <p className="mt-2 text-sm text-surface-500">{course.description}</p>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${difficultyColor[course.difficulty]}`}>
              <Tag className="h-3 w-3 mr-1" />
              {course.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-surface-500">
              <Clock className="h-3.5 w-3.5" /> {course.estimatedDuration ? `${course.estimatedDuration} min` : 'Self-paced'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-surface-500">
              <Users className="h-3.5 w-3.5" /> {course.enrollmentCount} enrolled
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-surface-500">
              <BarChart className="h-3.5 w-3.5" /> {course.completionRate}% completion
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[14px] border border-surface-100 p-3 text-center dark:border-surface-800">
              <p className="text-lg font-bold text-surface-900 dark:text-white">{course.modules.length}</p>
              <p className="text-xs text-surface-500">Modules</p>
            </div>
            <div className="rounded-[14px] border border-surface-100 p-3 text-center dark:border-surface-800">
              <p className="text-lg font-bold text-surface-900 dark:text-white">{totalLessons}</p>
              <p className="text-xs text-surface-500">Lessons</p>
            </div>
            <div className="rounded-[14px] border border-surface-100 p-3 text-center dark:border-surface-800">
              <p className="text-lg font-bold text-surface-900 dark:text-white">{totalQuestions}</p>
              <p className="text-xs text-surface-500">Quiz Questions</p>
            </div>
          </div>

          {/* Modules */}
          {course.modules.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Course Content</h4>
              <div className="space-y-2">
                {course.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="rounded-[14px] border border-surface-100 dark:border-surface-800 overflow-hidden">
                    <div className="flex items-center gap-3 bg-surface-50 px-4 py-2.5 dark:bg-surface-800">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-50 text-2xs font-bold text-success-600 dark:bg-success-500/10 dark:text-success-500">
                        {modIdx + 1}
                      </span>
                      <span className="text-sm font-medium text-surface-900 dark:text-white">{mod.title}</span>
                      <span className="ml-auto text-xs text-surface-400">{mod.lessons.length} lessons</span>
                    </div>
                    {mod.lessons.length > 0 && (
                      <ul className="divide-y divide-surface-100 dark:divide-surface-800">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 px-4 py-2">
                            <Play className="h-3.5 w-3.5 text-surface-400" />
                            <span className="flex-1 text-xs text-surface-600 dark:text-surface-400">{lesson.title}</span>
                            {lesson.duration && (
                              <span className="text-2xs text-surface-400">{Math.ceil(lesson.duration / 60)}m</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-surface-100 pt-4 dark:border-surface-800">
            <button onClick={onClose} className="btn-secondary text-sm">Close</button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-surface-500">Course not found.</div>
      )}
    </GenericModal>
  );
}
