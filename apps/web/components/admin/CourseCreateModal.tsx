'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus } from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import { adminCourseApi } from '@/lib/admin-course-api';
import type { AdminCourseListItem } from '@/types/admin-course';

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  description: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedDuration: z.number().int().min(1).optional().or(z.nan().transform(() => undefined)),
  status: z.enum(['DRAFT', 'PUBLISHED']),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

interface CourseCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (course: AdminCourseListItem) => void;
}

export default function CourseCreateModal({ open, onClose, onCreated }: CourseCreateModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { difficulty: 'BEGINNER', status: 'DRAFT' },
  });

  const onSubmit = async (data: CreateCourseFormData) => {
    setSaving(true);
    setError(null);
    try {
      const course = await adminCourseApi.createCourse({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        estimatedDuration: data.estimatedDuration || undefined,
        status: data.status,
      });
      onCreated(course);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GenericModal open={open} onClose={onClose} title="Create Course" className="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="rounded-[12px] bg-danger-50 p-3 text-sm font-medium text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
            Title <span className="text-danger-500">*</span>
          </label>
          <input
            {...register('title')}
            className="mt-2 block w-full input-field text-sm"
            placeholder="e.g. ISL Fundamentals"
            aria-invalid={!!errors.title}
          />
          {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-2 block w-full input-field text-sm resize-none"
            placeholder="Course description..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
              Difficulty
            </label>
            <select {...register('difficulty')} className="mt-2 block w-full input-field text-sm">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
              Duration (minutes)
            </label>
            <input
              {...register('estimatedDuration', { valueAsNumber: true })}
              type="number"
              min={1}
              className="mt-2 block w-full input-field text-sm"
              placeholder="e.g. 120"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
            Status
          </label>
          <select {...register('status')} className="mt-2 block w-full input-field text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 border-t border-surface-100 pt-4 dark:border-surface-800">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </GenericModal>
  );
}
