'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronRight, Play } from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import { adminCourseApi } from '@/lib/admin-course-api';
import type { AdminCourseListItem, AdminCourseDetail, AdminModule, AdminLesson } from '@/types/admin-course';

const editCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  estimatedDuration: z.number().int().min(1).optional().or(z.nan().transform(() => undefined)),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

type EditCourseFormData = z.infer<typeof editCourseSchema>;

interface CourseEditModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string | null;
  onSaved: (course: AdminCourseListItem) => void;
}

function LessonItem({ lesson, onDelete, onEdit }: { lesson: AdminLesson; onDelete: () => void; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800/50">
      <Play className="h-3.5 w-3.5 text-surface-400 flex-shrink-0" />
      <span className="flex-1 text-xs text-surface-700 dark:text-surface-300 truncate">{lesson.title}</span>
      {lesson.duration && <span className="text-2xs text-surface-400">{Math.ceil(lesson.duration / 60)}m</span>}
      <button onClick={onEdit} className="p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300" aria-label={`Edit lesson ${lesson.title}`}>
        <Pencil className="h-3 w-3" />
      </button>
      <button onClick={onDelete} className="p-1 text-surface-400 hover:text-danger-500" aria-label={`Delete lesson ${lesson.title}`}>
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function ModuleSection({ mod, onDelete, onEditLesson, onDeleteLesson }: {
  mod: AdminModule;
  onDelete: () => void;
  onEditLesson: (lesson: AdminLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[14px] border border-surface-200 dark:border-surface-700 overflow-hidden">
      <div className="flex items-center gap-2 bg-surface-50 px-3 py-2.5 dark:bg-surface-800">
        <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-surface-400" aria-label={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <GripVertical className="h-3.5 w-3.5 text-surface-300" />
        <span className="flex-1 text-sm font-medium text-surface-900 dark:text-white">{mod.title}</span>
        <span className="text-xs text-surface-400">{mod.lessons.length} lessons</span>
        <button onClick={() => onEditLesson({ id: '', title: '', description: null, videoUrl: null, duration: null, order: mod.lessons.length + 1, moduleId: mod.id } as any)} className="p-1 text-surface-400 hover:text-primary-500" aria-label="Add lesson">
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="p-1 text-surface-400 hover:text-danger-500" aria-label={`Delete module ${mod.title}`}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {expanded && mod.lessons.length > 0 && (
        <div className="divide-y divide-surface-100 dark:divide-surface-800 px-2 py-1">
          {mod.lessons.map((lesson) => (
            <LessonItem key={lesson.id} lesson={lesson} onEdit={() => onEditLesson(lesson)} onDelete={() => onDeleteLesson(lesson.id)} />
          ))}
        </div>
      )}
      {expanded && mod.lessons.length === 0 && (
        <p className="px-4 py-3 text-xs text-surface-400">No lessons yet.</p>
      )}
    </div>
  );
}

export default function CourseEditModal({ open, onClose, courseId, onSaved }: CourseEditModalProps) {
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<AdminModule[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCourseFormData>({
    resolver: zodResolver(editCourseSchema),
  });

  useEffect(() => {
    if (open && courseId) {
      setLoading(true);
      setError(null);
      adminCourseApi
        .getCourseById(courseId)
        .then((c) => {
          setCourse(c);
          setModules(c.modules);
          reset({
            title: c.title,
            description: c.description || '',
            difficulty: c.difficulty,
            estimatedDuration: c.estimatedDuration || undefined,
            status: c.status,
          });
        })
        .catch(() => setError('Failed to load course'))
        .finally(() => setLoading(false));
    } else {
      setCourse(null);
      setModules([]);
      reset();
    }
  }, [open, courseId, reset]);

  const onSubmit = async (data: EditCourseFormData) => {
    if (!courseId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminCourseApi.updateCourse(courseId, {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        estimatedDuration: data.estimatedDuration || undefined,
        status: data.status,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await adminCourseApi.deleteModule(moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    } catch { /* ignore */ }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await adminCourseApi.deleteLesson(lessonId);
      setModules((prev) =>
        prev.map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) })),
      );
    } catch { /* ignore */ }
  };

  return (
    <GenericModal open={open} onClose={onClose} title="Edit Course" className="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
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
            <input {...register('title')} className="mt-2 block w-full input-field text-sm" aria-invalid={!!errors.title} />
            {errors.title && <p className="mt-1 text-xs text-danger-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Description</label>
            <textarea {...register('description')} rows={3} className="mt-2 block w-full input-field text-sm resize-none" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Difficulty</label>
              <select {...register('difficulty')} className="mt-2 block w-full input-field text-sm">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Duration (min)</label>
              <input {...register('estimatedDuration', { valueAsNumber: true })} type="number" min={1} className="mt-2 block w-full input-field text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">Status</label>
              <select {...register('status')} className="mt-2 block w-full input-field text-sm">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Module Management */}
          {modules.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Modules ({modules.length})</h4>
              <div className="space-y-2">
                {modules.map((mod) => (
                  <ModuleSection
                    key={mod.id}
                    mod={mod}
                    onDelete={() => handleDeleteModule(mod.id)}
                    onEditLesson={() => {}}
                    onDeleteLesson={handleDeleteLesson}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-surface-100 pt-4 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </GenericModal>
  );
}
