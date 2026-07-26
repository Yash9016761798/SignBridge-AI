'use client';

import React from 'react';
import { User, Mail, Shield, Calendar, BookOpen, Award, Video } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import PageHeader from '@/components/dashboard/PageHeader';

export default function ProfilePage() {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Courses Enrolled', value: '0', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
    { label: 'Practice Sessions', value: '0', icon: Video, color: 'text-green-600 bg-green-50' },
    { label: 'Certificates', value: '0', icon: Award, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="View and manage your profile information" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {user ? `${user.firstName} ${user.lastName}` : 'Demo User'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{user?.role || 'LEARNER'}</p>
            <div className="mt-4 space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {user?.email || 'demo@signbridge.ai'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-gray-400" />
                {user?.isVerified ? 'Verified' : 'Demo Account'}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className={`inline-flex rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-gray-100 py-2">
                <dt className="text-sm text-gray-500">User ID</dt>
                <dd className="text-sm font-mono text-gray-900">
                  {user?.id || 'demo-user-001'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <dt className="text-sm text-gray-500">Account Type</dt>
                <dd className="text-sm text-gray-900">{user?.firebaseUid ? 'Firebase' : 'Demo'}</dd>
              </div>
              <div className="flex justify-between border-b border-gray-100 py-2">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm text-green-600">Active</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
