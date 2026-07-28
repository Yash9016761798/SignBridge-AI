'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  User,
  Mail,
  Shield,
  Calendar,
  BookOpen,
  Award,
  Video,
  Camera,
  Save,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import PageHeader from '@/components/dashboard/PageHeader';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  const stats = [
    {
      label: 'Courses Enrolled',
      value: '0',
      icon: BookOpen,
      color: 'bg-gradient-brand-soft text-primary-600',
    },
    {
      label: 'Practice Sessions',
      value: '0',
      icon: Video,
      color: 'bg-success-50 text-success-500',
    },
    { label: 'Certificates', value: '0', icon: Award, color: 'bg-secondary-50 text-secondary-600' },
  ];

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    if (user) {
      setUser({ ...user, firstName, lastName, email });
    }
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setAvatarPreview(null);
    setEditing(false);
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View and manage your profile information"
        icon={User}
        action={
          editing ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <User className="h-4 w-4" />
              Edit Profile
            </button>
          )
        }
      />

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-[16px] border border-success-100 bg-success-50 p-4 text-sm font-medium text-success-700 dark:border-success-800 dark:bg-success-500/10 dark:text-success-400"
        >
          <CheckCircle2 className="h-4 w-4" />
          Profile updated successfully!
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="rounded-card bg-white p-6 text-center shadow-card dark:bg-surface-900">
            {/* Avatar */}
            <div className="relative mx-auto">
              <button
                onClick={handleAvatarClick}
                className="group relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full gradient-bg shadow-glow transition-all hover:shadow-lg"
                aria-label="Change profile picture"
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile preview"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-surface-900">{initials}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-surface-900/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-surface-900 dark:text-white">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </h2>
            <p className="mt-1 text-sm font-semibold gradient-text">{user?.role || 'LEARNER'}</p>

            {/* Info */}
            <div className="mt-6 space-y-2.5 text-left">
              <div className="flex items-center gap-3 rounded-[14px] bg-surface-50 p-3 dark:bg-surface-800">
                <Mail className="h-4 w-4 text-surface-500 dark:text-surface-400" />
                <span className="text-sm text-surface-700 dark:text-surface-300 font-medium">
                  {user?.email || 'No email set'}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-surface-50 p-3 dark:bg-surface-800">
                <Shield className="h-4 w-4 text-surface-500 dark:text-surface-400" />
                <span className="text-sm text-surface-700 dark:text-surface-300 font-medium">
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-surface-50 p-3 dark:bg-surface-800">
                <Calendar className="h-4 w-4 text-surface-500 dark:text-surface-400" />
                <span className="text-sm text-surface-700 dark:text-surface-300 font-medium">
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Form & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="rounded-card bg-white p-5 shadow-card dark:bg-surface-900"
              >
                <div className={`inline-flex rounded-[14px] p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-2xl font-bold text-surface-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-surface-500 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Edit Form */}
          <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">
              {editing ? 'Edit Information' : 'Account Details'}
            </h3>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!editing}
                    className="mt-2 block w-full rounded-[18px] border border-surface-200 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-surface-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:disabled:bg-surface-800 dark:disabled:text-surface-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!editing}
                    className="mt-2 block w-full rounded-[18px] border border-surface-200 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-surface-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:disabled:bg-surface-800 dark:disabled:text-surface-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  className="mt-2 block w-full rounded-[18px] border border-surface-200 px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-surface-50 disabled:text-surface-500 dark:border-surface-700 dark:bg-surface-900 dark:text-white dark:disabled:bg-surface-800 dark:disabled:text-surface-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role || 'LEARNER'}
                  disabled
                  className="mt-2 block w-full rounded-[18px] border border-surface-200 px-4 py-2.5 text-sm shadow-sm bg-surface-50 text-surface-500 cursor-not-allowed dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.id || 'N/A'}
                  disabled
                  className="mt-2 block w-full rounded-[18px] border border-surface-200 px-4 py-2.5 font-mono text-sm shadow-sm bg-surface-50 text-surface-500 cursor-not-allowed dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
