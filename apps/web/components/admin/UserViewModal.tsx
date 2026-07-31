'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Video,
  MessageSquare,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import GenericModal from '@/components/dashboard/GenericModal';
import { adminUserApi } from '@/lib/admin-api';
import type { AdminUserDetail } from '@/types/admin';

interface UserViewModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

const roleBadgeColor: Record<string, string> = {
  LEARNER: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-500',
  TEACHER: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  INSTRUCTOR: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  ADMIN: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-500',
  HOSPITAL: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
  NGO: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-600',
  GOVERNMENT: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
};

const statusBadgeColor: Record<string, string> = {
  active: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  inactive: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
  suspended: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
};

const statusIcon: Record<string, React.ElementType> = {
  active: CheckCircle2,
  inactive: AlertTriangle,
  suspended: AlertTriangle,
};

export default function UserViewModal({ open, onClose, userId }: UserViewModalProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      adminUserApi
        .getUserById(userId)
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setUser(null);
    }
  }, [open, userId]);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '';

  const StatusIcon = user ? statusIcon[user.status] || CheckCircle2 : CheckCircle2;

  return (
    <GenericModal open={open} onClose={onClose} title="User Profile" className="max-w-2xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-lg font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-surface-500 truncate">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${roleBadgeColor[user.role]}`}>
                  {user.role}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadgeColor[user.status]}`}>
                  <StatusIcon className="h-3 w-3" />
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <Phone className="h-4 w-4 text-surface-400" />
                {user.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Mail className="h-4 w-4 text-surface-400" />
              {user.email}
            </div>
            {(user.city || user.state) && (
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <MapPin className="h-4 w-4 text-surface-400" />
                {[user.city, user.state].filter(Boolean).join(', ')}
              </div>
            )}
            {user.organizationName && (
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <Shield className="h-4 w-4 text-surface-400" />
                {user.organizationName}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Calendar className="h-4 w-4 text-surface-400" />
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
            {user.lastLoginAt && (
              <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                <Clock className="h-4 w-4 text-surface-400" />
                Last login {new Date(user.lastLoginAt).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">Bio</h4>
              <p className="text-sm text-surface-600 dark:text-surface-400">{user.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Courses', value: user.enrolledCourses, icon: BookOpen, color: 'text-info-600 bg-info-50 dark:bg-info-500/10 dark:text-info-500' },
              { label: 'Completed', value: user.completedCourses, icon: Award, color: 'text-success-600 bg-success-50 dark:bg-success-500/10 dark:text-success-500' },
              { label: 'Practice', value: user.practiceSessions, icon: Video, color: 'text-primary-600 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-500' },
              { label: 'Translations', value: user.translations, icon: MessageSquare, color: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-500/10 dark:text-secondary-600' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[14px] border border-surface-100 p-3 dark:border-surface-800">
                <div className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="mt-2 text-lg font-bold text-surface-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-surface-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          {user.recentActivity.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {user.recentActivity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-[12px] p-2 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-primary-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{a.resource}</p>
                      <p className="text-xs text-surface-500">{a.details}</p>
                      <p className="text-2xs text-surface-400 mt-0.5">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close */}
          <div className="flex justify-end border-t border-surface-100 pt-4 dark:border-surface-800">
            <button onClick={onClose} className="btn-secondary text-sm">
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-surface-500">User not found.</div>
      )}
    </GenericModal>
  );
}
