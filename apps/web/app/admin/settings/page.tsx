'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Palette,
  Brain,
  Server,
  Info,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Monitor,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  ExternalLink,
  Camera,
} from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { adminSettingsApi } from '@/lib/admin-settings-api';
import type { AdminSettings, SettingsTab } from '@/types/admin-settings';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'ai', label: 'AI Configuration', icon: Brain },
  { id: 'system', label: 'System', icon: Server },
  { id: 'about', label: 'About', icon: Info },
];

function Toggle({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={enabled}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SettingsField({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-3 border-b border-surface-100 dark:border-surface-800 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-surface-900 dark:text-white">{label}</p>
        {description && <p className="text-xs text-surface-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionBadge({ text }: { text: string }) {
  return <span className="rounded-full bg-warning-100 px-2 py-0.5 text-2xs font-bold text-warning-700 dark:bg-warning-500/10 dark:text-warning-500">{text}</span>;
}

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [localEdits, setLocalEdits] = useState<Record<string, unknown>>({});

  useEffect(() => { setMounted(true); }, []);

  const fetchSettings = useCallback(async () => {
    try { setSettings(await adminSettingsApi.getSettings()); } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (mounted) fetchSettings(); }, [mounted, fetchSettings]);

  const updateField = (key: string, value: unknown) => {
    setLocalEdits((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!settings || Object.keys(localEdits).length === 0) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const result = await adminSettingsApi.saveSettings(activeTab, localEdits);
      setSaveMessage(result.message);
      setLocalEdits({});
      setTimeout(() => setSaveMessage(''), 4000);
    } catch { setSaveMessage('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const getVal = (key: string, fallback: unknown) => localEdits[key] !== undefined ? localEdits[key] : fallback;

  if (!mounted || loading || !settings) return <div className="space-y-6"><PageHeader title="Settings" icon={Settings} /><SkeletonLoader count={6} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage platform configuration" icon={Settings} />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab Sidebar */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:w-56 flex-shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setLocalEdits({}); setSaveMessage(''); }}
                className={`flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-surface-600 hover:bg-surface-50 dark:text-surface-400 dark:hover:bg-surface-800'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-card bg-white p-6 shadow-card dark:bg-surface-900">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">General Settings</h3>
                <SettingsField label="Platform Name" description="Display name for the platform">
                  <input value={getVal('platformName', settings.general.platformName) as string} onChange={(e) => updateField('platformName', e.target.value)} className="input-field w-64 text-sm" />
                </SettingsField>
                <SettingsField label="Organization" description="Organization name">
                  <input value={getVal('organization', settings.general.organization) as string} onChange={(e) => updateField('organization', e.target.value)} className="input-field w-64 text-sm" />
                </SettingsField>
                <SettingsField label="Default Language" description="Default language for new users">
                  <select value={getVal('defaultLanguage', settings.general.defaultLanguage) as string} onChange={(e) => updateField('defaultLanguage', e.target.value)} className="input-field w-48 text-sm">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="as">Assamese</option>
                    <option value="bn">Bengali</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                  </select>
                </SettingsField>
                <SettingsField label="Timezone" description="Default timezone">
                  <select value={getVal('timezone', settings.general.timezone) as string} onChange={(e) => updateField('timezone', e.target.value)} className="input-field w-48 text-sm">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </SettingsField>
                <SettingsField label="Date Format" description="Date display format">
                  <select value={getVal('dateFormat', settings.general.dateFormat) as string} onChange={(e) => updateField('dateFormat', e.target.value)} className="input-field w-48 text-sm">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </SettingsField>
                <SettingsField label="Logo" description="Platform logo">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface-100 dark:bg-surface-800">
                      <Camera className="h-5 w-5 text-surface-400" />
                    </div>
                    <button disabled className="btn-secondary text-xs opacity-50 cursor-not-allowed">
                      Upload <SectionBadge text="TODO" />
                    </button>
                  </div>
                </SettingsField>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Security Settings</h3>
                <SettingsField label="Firebase Authentication" description="Firebase auth provider status">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${settings.security.firebaseEnabled ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500' : 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400'}`}>
                      {settings.security.firebaseEnabled ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {settings.security.firebaseEnabled ? 'Enabled' : 'Disabled (Demo Mode)'}
                    </span>
                  </div>
                </SettingsField>
                <SettingsField label="JWT Authentication" description="JWT token verification">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-bold text-success-600 dark:bg-success-500/10 dark:text-success-500">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                </SettingsField>
                <SettingsField label="Password Policy" description="Minimum password requirements">
                  <span className="text-sm text-surface-600 dark:text-surface-400">{settings.security.passwordPolicy}</span>
                </SettingsField>
                <SettingsField label="Session Timeout" description="Auto-logout after inactivity (minutes)">
                  <input type="number" value={getVal('sessionTimeout', settings.security.sessionTimeout) as number} onChange={(e) => updateField('sessionTimeout', Number(e.target.value))} className="input-field w-24 text-sm" min={5} max={480} />
                </SettingsField>
                <SettingsField label="Two-Factor Authentication" description="Require 2FA for admin accounts">
                  <div className="flex items-center gap-2">
                    <Toggle enabled={getVal('twoFactorEnabled', settings.security.twoFactorEnabled) as boolean} onToggle={() => updateField('twoFactorEnabled', !settings.security.twoFactorEnabled)} disabled />
                    <SectionBadge text="TODO" />
                  </div>
                </SettingsField>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Role Permissions</h4>
                  <div className="space-y-2">
                    {settings.security.rolePermissions.map((rp) => (
                      <div key={rp.role} className="rounded-[12px] border border-surface-100 p-3 dark:border-surface-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-surface-900 dark:text-white">{rp.role}</span>
                          <span className="text-2xs text-surface-400">{rp.permissions.length} permissions</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {rp.permissions.map((p) => (
                            <span key={p} className="rounded-full bg-surface-100 px-2 py-0.5 text-2xs text-surface-600 dark:bg-surface-800 dark:text-surface-400">{p}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Notification Settings</h3>
                <SettingsField label="Email Notifications" description="Receive notifications via email">
                  <Toggle enabled={getVal('emailNotifications', settings.notifications.emailNotifications) as boolean} onToggle={() => updateField('emailNotifications', !settings.notifications.emailNotifications)} />
                </SettingsField>
                <SettingsField label="Push Notifications" description="Browser push notifications">
                  <Toggle enabled={getVal('pushNotifications', settings.notifications.pushNotifications) as boolean} onToggle={() => updateField('pushNotifications', !settings.notifications.pushNotifications)} />
                </SettingsField>
                <SettingsField label="SMS Notifications" description="Receive critical alerts via SMS">
                  <div className="flex items-center gap-2">
                    <Toggle enabled={getVal('smsNotifications', settings.notifications.smsNotifications) as boolean} onToggle={() => updateField('smsNotifications', !settings.notifications.smsNotifications)} disabled />
                    <SectionBadge text="TODO" />
                  </div>
                </SettingsField>
                <SettingsField label="System Alerts" description="Platform system notifications">
                  <Toggle enabled={getVal('systemAlerts', settings.notifications.systemAlerts) as boolean} onToggle={() => updateField('systemAlerts', !settings.notifications.systemAlerts)} />
                </SettingsField>
                <SettingsField label="AI Alerts" description="AI service status and error alerts">
                  <Toggle enabled={getVal('aiAlerts', settings.notifications.aiAlerts) as boolean} onToggle={() => updateField('aiAlerts', !settings.notifications.aiAlerts)} />
                </SettingsField>
                <SettingsField label="Maintenance Alerts" description="Scheduled maintenance notifications">
                  <Toggle enabled={getVal('maintenanceAlerts', settings.notifications.maintenanceAlerts) as boolean} onToggle={() => updateField('maintenanceAlerts', !settings.notifications.maintenanceAlerts)} />
                </SettingsField>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Appearance Settings</h3>
                <SettingsField label="Theme" description="Application color theme">
                  <select value={getVal('theme', settings.appearance.theme) as string} onChange={(e) => updateField('theme', e.target.value)} className="input-field w-40 text-sm">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </SettingsField>
                <SettingsField label="Accent Color" description="Primary accent color">
                  <div className="flex items-center gap-2">
                    {['#E9A8C9', '#A9D6F5', '#B8E6C3', '#F7C873', '#F6D365'].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateField('accentColor', c)}
                        className={`h-7 w-7 rounded-full border-2 transition-transform ${(getVal('accentColor', settings.appearance.accentColor) as string) === c ? 'border-surface-900 scale-110 dark:border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </SettingsField>
                <SettingsField label="Sidebar Style" description="Navigation sidebar layout">
                  <select value={getVal('sidebarStyle', settings.appearance.sidebarStyle) as string} onChange={(e) => updateField('sidebarStyle', e.target.value)} className="input-field w-40 text-sm">
                    <option value="default">Default</option>
                    <option value="compact">Compact</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </SettingsField>
                <SettingsField label="Compact Mode" description="Reduce spacing and padding">
                  <Toggle enabled={getVal('compactMode', settings.appearance.compactMode) as boolean} onToggle={() => updateField('compactMode', !settings.appearance.compactMode)} />
                </SettingsField>
                <SettingsField label="Animations" description="Enable UI animations and transitions">
                  <Toggle enabled={getVal('animations', settings.appearance.animations) as boolean} onToggle={() => updateField('animations', !settings.appearance.animations)} />
                </SettingsField>
              </div>
            )}

            {/* AI Configuration Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                  AI Configuration <SectionBadge text="Read-only" />
                </h3>
                <SettingsField label="Current Model" description="Active AI model architecture">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{settings.ai.currentModel}</span>
                </SettingsField>
                <SettingsField label="Model Version" description="Loaded model checkpoint version">
                  <span className="text-sm text-surface-600 dark:text-surface-400">{settings.ai.modelVersion}</span>
                </SettingsField>
                <SettingsField label="Confidence Threshold" description="Minimum confidence for predictions">
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} value={settings.ai.confidenceThreshold * 100} disabled className="w-32 accent-primary-500 opacity-50" />
                    <span className="text-sm text-surface-500 w-10">{(settings.ai.confidenceThreshold * 100).toFixed(0)}%</span>
                  </div>
                </SettingsField>
                <SettingsField label="Prediction Timeout" description="Maximum inference time (seconds)">
                  <span className="text-sm text-surface-600 dark:text-surface-400">{settings.ai.predictionTimeout}s</span>
                </SettingsField>
                <SettingsField label="Inference Mode" description="Current operating mode">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${settings.ai.inferenceMode === 'Demo' ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500' : 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500'}`}>
                    {settings.ai.inferenceMode === 'Demo' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {settings.ai.inferenceMode}
                  </span>
                </SettingsField>
                <SettingsField label="Device" description="Inference compute device">
                  <span className="text-sm text-surface-600 dark:text-surface-400">{settings.ai.device}</span>
                </SettingsField>
                <SettingsField label="Auto Reload Model" description="Automatically reload on checkpoint update">
                  <div className="flex items-center gap-2">
                    <Toggle enabled={settings.ai.autoReloadModel} onToggle={() => {}} disabled />
                    <SectionBadge text="TODO" />
                  </div>
                </SettingsField>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">System Information</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Backend Version', value: settings.system.backendVersion, icon: Server },
                    { label: 'Frontend Version', value: settings.system.frontendVersion, icon: Monitor },
                    { label: 'Database', value: settings.system.database, icon: Database },
                    { label: 'Storage', value: settings.system.storage, icon: HardDrive },
                    { label: 'Memory Usage', value: settings.system.memoryUsage, icon: MemoryStick },
                    { label: 'CPU Usage', value: settings.system.cpuUsage, icon: Cpu },
                    { label: 'Disk Usage', value: settings.system.diskUsage, icon: HardDrive },
                    { label: 'Environment', value: settings.system.environment, icon: Globe },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-[12px) border border-surface-100 p-3 dark:border-surface-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-surface-100 dark:bg-surface-800">
                        <item.icon className="h-4 w-4 text-surface-500" />
                      </div>
                      <div>
                        <p className="text-2xs text-surface-400">{item.label}</p>
                        <p className="text-sm font-semibold text-surface-900 dark:text-white">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-[12px] border border-surface-100 p-4 dark:border-surface-800">
                  <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-2">Health Status</h4>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-bold text-warning-600 dark:bg-warning-500/10 dark:text-warning-500">
                      <AlertTriangle className="h-3 w-3" /> {settings.system.healthStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">About SignBridge AI</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Project Version', value: settings.about.projectVersion },
                    { label: 'Build Date', value: settings.about.buildDate },
                    { label: 'License', value: settings.about.license },
                    { label: 'Developers', value: settings.about.developers },
                    { label: 'Git Commit', value: settings.about.gitCommit },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <span className="text-sm text-surface-500">{item.label}</span>
                      <span className="text-sm font-medium text-surface-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-surface-500">Repository</span>
                    <a href={settings.about.repository} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Save Bar */}
            <div className="mt-6 flex items-center justify-between border-t border-surface-100 pt-4 dark:border-surface-800">
              <div className="min-w-0">
                {saveMessage && (
                  <p className="text-sm text-surface-500 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning-500" /> {saveMessage}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {Object.keys(localEdits).length > 0 && (
                  <span className="text-2xs text-surface-400">{Object.keys(localEdits).length} unsaved change{Object.keys(localEdits).length > 1 ? 's' : ''}</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || Object.keys(localEdits).length === 0}
                  className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
