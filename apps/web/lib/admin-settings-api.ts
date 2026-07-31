import type { AdminSettings } from '@/types/admin-settings';

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

const DEFAULT_SETTINGS: AdminSettings = {
  general: {
    platformName: 'SignBridge AI',
    organization: 'SignBridge Foundation',
    defaultLanguage: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    logoUrl: null,
  },
  security: {
    firebaseEnabled: false,
    jwtEnabled: true,
    passwordPolicy: 'Minimum 8 characters, 1 uppercase, 1 number',
    sessionTimeout: 60,
    twoFactorEnabled: false,
    rolePermissions: [
      { role: 'ADMIN', permissions: ['users:read', 'users:write', 'courses:read', 'courses:write', 'dictionary:read', 'dictionary:write', 'settings:read', 'settings:write', 'analytics:read', 'ai:manage'] },
      { role: 'TEACHER', permissions: ['courses:read', 'courses:write', 'dictionary:read', 'analytics:read'] },
      { role: 'INSTRUCTOR', permissions: ['courses:read', 'dictionary:read'] },
      { role: 'LEARNER', permissions: ['courses:read', 'dictionary:read'] },
      { role: 'HOSPITAL', permissions: ['courses:read', 'dictionary:read', 'analytics:read'] },
      { role: 'NGO', permissions: ['courses:read', 'dictionary:read', 'analytics:read'] },
      { role: 'GOVERNMENT', permissions: ['courses:read', 'dictionary:read', 'analytics:read'] },
    ],
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    aiAlerts: true,
    maintenanceAlerts: true,
  },
  appearance: {
    theme: 'light',
    accentColor: '#E9A8C9',
    sidebarStyle: 'default',
    compactMode: false,
    animations: true,
  },
  ai: {
    currentModel: 'PoseTransformer',
    modelVersion: '1.0.0',
    confidenceThreshold: 0.70,
    predictionTimeout: 30,
    inferenceMode: 'Demo',
    device: 'CPU',
    autoReloadModel: false,
  },
  system: {
    backendVersion: '0.1.0',
    frontendVersion: '1.0.0',
    database: 'PostgreSQL 15 (Disconnected)',
    storage: 'Local Filesystem',
    memoryUsage: '512 MB / 2048 MB',
    cpuUsage: '34%',
    diskUsage: '2.1 GB / 10 GB',
    environment: 'development',
    healthStatus: 'Partial (DB offline)',
  },
  about: {
    projectVersion: '1.0.0-alpha',
    buildDate: '2025-07-31',
    license: 'MIT',
    developers: 'SignBridge Team',
    gitCommit: 'a1b2c3d',
    repository: 'https://github.com/signbridge/signbridge-ai',
  },
};

let settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as AdminSettings;

export const adminSettingsApi = {
  async getSettings(): Promise<AdminSettings> {
    await delay(300);
    return JSON.parse(JSON.stringify(settings));
  },

  async saveSettings(section: keyof AdminSettings, data: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    await delay(500);
    // TODO: Backend needs SystemSetting CRUD endpoints
    // eslint-disable-next-line
    (settings as any)[section] = { ...settings[section], ...data };
    return { success: false, message: 'Settings saved locally. Backend persistence not yet implemented.' };
  },

  async uploadLogo(file: File): Promise<{ success: boolean; url: string }> {
    await delay(500);
    // TODO: Backend needs file upload endpoint (Cloudinary/S3)
    return { success: false, url: '' };
  },

  async resetSettings(): Promise<{ success: boolean }> {
    await delay(300);
    settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    return { success: true };
  },
};
