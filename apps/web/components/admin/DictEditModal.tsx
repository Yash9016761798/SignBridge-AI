'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Video, Image, CheckCircle2, AlertTriangle } from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import { adminDictApi } from '@/lib/admin-dictionary-api';
import type { AdminDictCategory, AdminDictDifficulty, AdminDictStatus } from '@/types/admin-dictionary';

const editSchema = z.object({
  word: z.string().min(1, 'Word is required').max(100),
  meaning: z.string().min(1, 'Meaning is required').max(500),
  categoryId: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  status: z.enum(['ACTIVE', 'ARCHIVED']),
  videoUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

interface DictEditModalProps {
  open: boolean;
  onClose: () => void;
  signId: string | null;
  onSaved: () => void;
}

export default function DictEditModal({ open, onClose, signId, onSaved }: DictEditModalProps) {
  const [categories, setCategories] = useState<AdminDictCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { word: '', meaning: '', categoryId: '', difficulty: 'BEGINNER', status: 'ACTIVE', videoUrl: '', imageUrl: '', tags: '' },
  });

  useEffect(() => {
    if (open && signId) {
      setLoading(true);
      setError('');
      Promise.all([
        adminDictApi.getSignById(signId),
        adminDictApi.getCategories(),
      ]).then(([sign, cats]) => {
        setCategories(cats);
        reset({
          word: sign.word,
          meaning: sign.meaning,
          categoryId: sign.category.id,
          difficulty: sign.difficulty,
          status: sign.status,
          videoUrl: sign.videoUrl || '',
          imageUrl: sign.imageUrl || '',
          tags: sign.tags.join(', '),
        });
      }).catch(() => setError('Failed to load sign')).finally(() => setLoading(false));
    }
  }, [open, signId, reset]);

  const onSubmit = async (data: EditForm) => {
    if (!signId) return;
    setSubmitting(true);
    setError('');
    try {
      await adminDictApi.updateSign(signId, {
        word: data.word,
        meaning: data.meaning,
        categoryId: data.categoryId,
        difficulty: data.difficulty as AdminDictDifficulty,
        status: data.status as AdminDictStatus,
        videoUrl: data.videoUrl || undefined,
        imageUrl: data.imageUrl || undefined,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      onSaved();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update sign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GenericModal open={open} onClose={onClose} title="Edit Sign" className="max-w-xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <div className="rounded-[12px] bg-danger-50 p-3 text-sm text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">{error}</div>}

          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Word *</label>
            <input {...register('word')} className="input-field" />
            {errors.word && <p className="mt-1 text-xs text-danger-500">{errors.word.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Meaning *</label>
            <textarea {...register('meaning')} rows={3} className="input-field resize-none" />
            {errors.meaning && <p className="mt-1 text-xs text-danger-500">{errors.meaning.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Category *</label>
              <select {...register('categoryId')} className="input-field">
                <option value="">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-danger-500">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Difficulty</label>
              <select {...register('difficulty')} className="input-field">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Status</label>
              <select {...register('status')} className="input-field">
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Image URL</label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input {...register('imageUrl')} className="input-field pl-10" placeholder="https://example.com/image.jpg" />
            </div>
            {errors.imageUrl && <p className="mt-1 text-xs text-danger-500">{errors.imageUrl.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Video URL</label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input {...register('videoUrl')} className="input-field pl-10" placeholder="https://example.com/video.mp4" />
            </div>
            {errors.videoUrl && <p className="mt-1 text-xs text-danger-500">{errors.videoUrl.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">Tags (comma-separated)</label>
            <input {...register('tags')} className="input-field" placeholder="greeting, polite" />
          </div>

          <div className="flex justify-end gap-2 border-t border-surface-100 pt-4 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-secondary text-sm" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary text-sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </GenericModal>
  );
}
