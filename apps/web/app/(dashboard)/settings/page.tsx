'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import PageHeader from '@/components/dashboard/PageHeader';

type SettingsTab = 'profile' | 'notifications' | 'security';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    courseUpdates: true,
    newSigns: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Manage your personal information',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Configure notification preferences',
    },
    { id: 'security', label: 'Security', icon: Shield, description: 'Manage security settings' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences" icon={Settings} />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab Navigation */}
        <nav className="flex lg:w-64 lg:flex-col lg:gap-1" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-3 rounded-[14px] px-4 py-3 text-left text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-brand-soft text-primary-700 shadow-sm dark:text-primary-400'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200'
              }`}
            >
              <tab.icon
                className={`h-5 w-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-surface-500 group-hover:text-surface-700 dark:text-surface-400 dark:group-hover:text-surface-300'}`}
              />
              <div>
                <div className="font-semibold">{tab.label}</div>
                <div className="text-xs text-surface-500 dark:text-surface-400">
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 rounded-card bg-white p-6 shadow-card dark:bg-surface-900"
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                  Profile Settings
                </h2>
                <p className="mt-1 text-sm text-surface-500">Update your personal information</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-2 block w-full input-field text-sm"
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
                      className="mt-2 block w-full input-field text-sm"
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
                    className="mt-2 block w-full input-field text-sm"
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
                    className="mt-2 block w-full input-field text-sm bg-surface-50 text-surface-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="mt-1 text-sm text-surface-500">Choose how you want to be notified</p>
              </div>
              <div className="space-y-3">
                {Object.entries({
                  email: 'Email notifications',
                  push: 'Push notifications',
                  courseUpdates: 'Course updates',
                  newSigns: 'New signs added',
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-[16px] border border-surface-200 p-4 transition-colors hover:border-surface-300 cursor-pointer dark:border-surface-700 dark:hover:border-surface-600"
                  >
                    <div>
                      <span className="text-sm font-semibold text-surface-900 dark:text-white">
                        {label}
                      </span>
                      <p className="text-xs text-surface-500 mt-0.5">
                        Receive {label.toLowerCase()} for your account
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof prev],
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key as keyof typeof notifications]
                          ? 'gradient-bg'
                          : 'bg-surface-200 dark:bg-surface-700'
                      }`}
                      role="switch"
                      aria-checked={notifications[key as keyof typeof notifications]}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          notifications[key as keyof typeof notifications]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                  Security Settings
                </h2>
                <p className="mt-1 text-sm text-surface-500">Manage your account security</p>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Security settings are managed through your authentication provider.
              </p>
              <div className="rounded-[16px] bg-warning-50 p-4 border border-warning-100 dark:bg-warning-500/10 dark:border-warning-800">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {user?.firebaseUid
                    ? 'Your account is secured with Firebase Authentication.'
                    : 'You are using demo authentication. Configure Firebase for production security.'}
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex items-center gap-3 border-t border-surface-100 pt-6 dark:border-surface-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 text-sm font-semibold text-success-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                Settings saved successfully!
              </motion.span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
