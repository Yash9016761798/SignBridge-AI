'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import { adminUserApi } from '@/lib/admin-api';
import type { AdminUser, AdminUserRole, AdminUserStatus } from '@/types/admin';

const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['LEARNER', 'INSTRUCTOR', 'TEACHER', 'HOSPITAL', 'NGO', 'GOVERNMENT', 'ADMIN']),
  status: z.enum(['active', 'inactive', 'suspended']),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface UserEditModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onSaved: (user: AdminUser) => void;
}

const roleOptions: { value: AdminUserRole; label: string }[] = [
  { value: 'LEARNER', label: 'Student (Learner)' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'INSTRUCTOR', label: 'Instructor' },
  { value: 'HOSPITAL', label: 'Hospital Staff' },
  { value: 'NGO', label: 'NGO Member' },
  { value: 'GOVERNMENT', label: 'Government Official' },
  { value: 'ADMIN', label: 'Administrator' },
];

const statusOptions: { value: AdminUserStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

export default function UserEditModal({ open, onClose, userId, onSaved }: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      setError(null);
      adminUserApi
        .getUserById(userId)
        .then((user) => {
          reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
          });
        })
        .catch(() => setError('Failed to load user data'))
        .finally(() => setLoading(false));
    } else {
      reset();
      setError(null);
    }
  }, [open, userId, reset]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminUserApi.updateUser(userId, data);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GenericModal open={open} onClose={onClose} title="Edit User" className="max-w-lg">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                First Name
              </label>
              <input
                {...register('firstName')}
                className="mt-2 block w-full input-field text-sm"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-danger-500">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                Last Name
              </label>
              <input
                {...register('lastName')}
                className="mt-2 block w-full input-field text-sm"
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-danger-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-2 block w-full input-field text-sm"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-danger-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                Role
              </label>
              <select
                {...register('role')}
                className="mt-2 block w-full input-field text-sm"
                aria-invalid={!!errors.role}
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-danger-500">{errors.role.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                Status
              </label>
              <select
                {...register('status')}
                className="mt-2 block w-full input-field text-sm"
                aria-invalid={!!errors.status}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1 text-xs text-danger-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-surface-100 pt-4 dark:border-surface-800">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Cancel
            </button>
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
