'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Calendar,
  BookOpen,
  Award,
  Video,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import PageHeader from '@/components/dashboard/PageHeader';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const stats = [
    {
      label: 'Courses Enrolled',
      value: '0',
      icon: BookOpen,
      color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/50',
    },
    {
      label: 'Practice Sessions',
      value: '0',
      icon: Video,
      color: 'text-accent-500 bg-accent-50 dark:bg-accent-950/50',
    },
    {
      label: 'Certificates',
      value: '0',
      icon: Award,
      color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-950/50',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage your profile information"
        icon={User}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="rounded-2xl border border-surface-200 bg-white p-6 text-center shadow-card dark:border-surface-800 dark:bg-surface-900">
            {/* Avatar */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-glow">
              <User className="h-12 w-12 text-white" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-surface-900 dark:text-white">
              {user ? `${user.firstName} ${user.lastName}` : 'Demo User'}
            </h2>
            <p className="mt-1 text-sm font-medium text-primary-500">{user?.role || 'LEARNER'}</p>

            {/* Info */}
            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 rounded-xl bg-surface-50 p-3 dark:bg-surface-800">
                <Mail className="h-4 w-4 text-surface-400" />
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  {user?.email || 'demo@signbridge.ai'}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface-50 p-3 dark:bg-surface-800">
                <Shield className="h-4 w-4 text-surface-400" />
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  {user?.isVerified ? 'Verified' : 'Demo Account'}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-surface-50 p-3 dark:bg-surface-800">
                <Calendar className="h-4 w-4 text-surface-400" />
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <Link
              href="/settings"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-medium text-surface-700 transition-all hover:bg-surface-50 hover:border-surface-300 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700"
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Link>
          </div>
        </motion.div>

        {/* Stats & Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-2xl border border-surface-200 bg-white p-5 shadow-card dark:border-surface-800 dark:bg-surface-900"
              >
                <div className={`inline-flex rounded-xl p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-2xl font-bold text-surface-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-surface-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Account Details */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-card dark:border-surface-800 dark:bg-surface-900">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              Account Details
            </h3>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-surface-50 p-4 dark:bg-surface-800">
                <dt className="text-sm text-surface-500">User ID</dt>
                <dd className="font-mono text-sm font-medium text-surface-900 dark:text-white">
                  {user?.id || 'demo-user-001'}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-50 p-4 dark:bg-surface-800">
                <dt className="text-sm text-surface-500">Account Type</dt>
                <dd className="text-sm font-medium text-surface-900 dark:text-white">
                  {user?.firebaseUid ? 'Firebase' : 'Demo'}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-50 p-4 dark:bg-surface-800">
                <dt className="text-sm text-surface-500">Status</dt>
                <dd className="flex items-center gap-1.5 text-sm font-medium text-success-600">
                  <span className="h-2 w-2 rounded-full bg-success-500" />
                  Active
                </dd>
              </div>
            </dl>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
