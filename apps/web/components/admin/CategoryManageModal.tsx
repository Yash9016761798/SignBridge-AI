'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, Hash, CheckCircle2 } from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import ConfirmDialog from '@/components/dashboard/ConfirmDialog';
import { adminDictApi } from '@/lib/admin-dictionary-api';
import type { AdminDictCategory } from '@/types/admin-dictionary';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

interface CategoryManageModalProps {
  open: boolean;
  onClose: () => void;
  onCategoryChange: () => void;
}

export default function CategoryManageModal({ open, onClose, onCategoryChange }: CategoryManageModalProps) {
  const [categories, setCategories] = useState<AdminDictCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<AdminDictCategory | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', description: '', icon: '' },
  });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try { setCategories(await adminDictApi.getCategories()); } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (open) { fetchCategories(); setEditingId(null); reset(); } }, [open, fetchCategories, reset]);

  const onSubmit = async (data: CategoryForm) => {
    setError('');
    try {
      if (editingId) {
        await adminDictApi.updateCategory(editingId, { name: data.name, description: data.description || undefined, icon: data.icon || undefined });
      } else {
        await adminDictApi.createCategory({ name: data.name, description: data.description, icon: data.icon });
      }
      reset();
      setEditingId(null);
      fetchCategories();
      onCategoryChange();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save category');
    }
  };

  const handleEdit = (cat: AdminDictCategory) => {
    setEditingId(cat.id);
    reset({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await adminDictApi.deleteCategory(confirmDelete.id);
      fetchCategories();
      onCategoryChange();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete category');
    }
    setConfirmDelete(null);
  };

  return (
    <GenericModal open={open} onClose={onClose} title="Manage Categories" className="max-w-xl">
      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-3 rounded-[14px] border border-surface-200 p-4 dark:border-surface-700">
        <h4 className="text-sm font-semibold text-surface-900 dark:text-white">{editingId ? 'Edit Category' : 'Add Category'}</h4>
        {error && <div className="rounded-[10px] bg-danger-50 p-2 text-xs text-danger-600 dark:bg-danger-500/10 dark:text-danger-400">{error}</div>}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <input {...register('name')} className="input-field text-sm" placeholder="Category name" />
            {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name.message}</p>}
          </div>
          <div>
            <input {...register('icon')} className="input-field text-sm" placeholder="Icon (optional)" />
          </div>
        </div>
        <input {...register('description')} className="input-field text-sm" placeholder="Description (optional)" />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary text-sm inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); reset(); }} className="btn-secondary text-sm">Cancel</button>
          )}
        </div>
      </form>

      {/* Category List */}
      {loading ? (
        <div className="flex justify-center py-6"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-[12px] border border-surface-100 p-3 dark:border-surface-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Hash className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{cat.name}</p>
                  <p className="text-xs text-surface-500">{cat.signCount} signs</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(cat)} className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[8px] p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setConfirmDelete(cat)} className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[8px] p-1 text-surface-400 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end border-t border-surface-100 pt-4 mt-4 dark:border-surface-800">
        <button onClick={onClose} className="btn-secondary text-sm">Done</button>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={confirmDelete ? `"${confirmDelete.name}" — ${confirmDelete.signCount > 0 ? `Cannot delete: ${confirmDelete.signCount} signs still assigned.` : 'Are you sure?'}` : ''}
        confirmLabel="Delete"
        variant={confirmDelete && confirmDelete.signCount > 0 ? 'warning' : 'danger'}
      />
    </GenericModal>
  );
}
