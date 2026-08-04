import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

interface GeneralSettings {
  platformName: string;
  organization: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  logoUrl: string | null;
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
}

interface SecuritySettings {
  firebaseEnabled: boolean;
  jwtEnabled: boolean;
  passwordPolicy: string;
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  rolePermissions: { role: string; permissions: string[] }[];
  defaultUserRole?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  systemAlerts: boolean;
  aiAlerts: boolean;
  maintenanceAlerts: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  sidebarStyle: 'default' | 'compact' | 'minimal';
  compactMode: boolean;
  animations: boolean;
}

interface AiSettings {
  currentModel: string;
  modelVersion: string;
  confidenceThreshold: number;
  predictionTimeout: number;
  inferenceMode: string;
  device: string;
  autoReloadModel: boolean;
  translationProvider?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

interface SystemInfo {
  backendVersion: string;
  frontendVersion: string;
  database: string;
  storage: string;
  memoryUsage: string;
  cpuUsage: string;
  diskUsage: string;
  environment: string;
  healthStatus: string;
}

interface AboutInfo {
  projectVersion: string;
  buildDate: string;
  license: string;
  developers: string;
  gitCommit: string;
  repository: string;
}

export interface AdminSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  ai: AiSettings;
  system: SystemInfo;
  about: AboutInfo;
}

@Injectable()
export class AdminSettingsService {
  private readonly logger = new Logger(AdminSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultSettings: AdminSettings = {
    general: {
      platformName: 'SignBridge AI',
      organization: 'SignBridge Foundation',
      defaultLanguage: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      logoUrl: null,
      maintenanceMode: false,
      registrationEnabled: true,
    },
    security: {
      firebaseEnabled: false,
      jwtEnabled: true,
      passwordPolicy: 'Minimum 8 characters, 1 uppercase, 1 number',
      sessionTimeout: 60,
      twoFactorEnabled: false,
      rolePermissions: [
        {
          role: 'ADMIN',
          permissions: [
            'users:read',
            'users:write',
            'courses:read',
            'courses:write',
            'dictionary:read',
            'dictionary:write',
            'settings:read',
            'settings:write',
            'analytics:read',
            'ai:manage',
          ],
        },
        {
          role: 'TEACHER',
          permissions: ['courses:read', 'courses:write', 'dictionary:read', 'analytics:read'],
        },
        { role: 'INSTRUCTOR', permissions: ['courses:read', 'dictionary:read'] },
        { role: 'LEARNER', permissions: ['courses:read', 'dictionary:read'] },
        { role: 'HOSPITAL', permissions: ['courses:read', 'dictionary:read', 'analytics:read'] },
        { role: 'NGO', permissions: ['courses:read', 'dictionary:read', 'analytics:read'] },
        { role: 'GOVERNMENT', permissions: ['courses:read', 'dictionary:read', 'analytics:read'] },
      ],
      defaultUserRole: 'LEARNER',
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
      confidenceThreshold: 0.7,
      predictionTimeout: 30,
      inferenceMode: 'Demo',
      device: 'CPU',
      autoReloadModel: false,
      translationProvider: 'google',
      sourceLanguage: 'en',
      targetLanguage: 'isl',
    },
    system: {
      backendVersion: '0.1.0',
      frontendVersion: '1.0.0',
      database: 'PostgreSQL',
      storage: 'Local Filesystem',
      memoryUsage: 'N/A',
      cpuUsage: 'N/A',
      diskUsage: 'N/A',
      environment: process.env.NODE_ENV || 'development',
      healthStatus: 'Healthy',
    },
    about: {
      projectVersion: '1.0.0-alpha',
      buildDate: new Date().toISOString().split('T')[0],
      license: 'MIT',
      developers: 'SignBridge Team',
      gitCommit: process.env.GIT_COMMIT || 'local',
      repository: 'https://github.com/signbridge/signbridge-ai',
    },
  };

  private getSectionKey(section: string): string {
    return `settings.${section}`;
  }

  private async loadSection<T>(section: string, defaults: T): Promise<T> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: this.getSectionKey(section) },
    });

    if (!setting || !setting.value) {
      return defaults;
    }

    try {
      const stored = JSON.parse(setting.value) as T;
      return { ...defaults, ...stored };
    } catch {
      return defaults;
    }
  }

  async getSettings(): Promise<AdminSettings> {
    const [general, security, notifications, appearance, ai] = await Promise.all([
      this.loadSection<GeneralSettings>('general', this.defaultSettings.general),
      this.loadSection<SecuritySettings>('security', this.defaultSettings.security),
      this.loadSection<NotificationSettings>('notifications', this.defaultSettings.notifications),
      this.loadSection<AppearanceSettings>('appearance', this.defaultSettings.appearance),
      this.loadSection<AiSettings>('ai', this.defaultSettings.ai),
    ]);

    return {
      general,
      security,
      notifications,
      appearance,
      ai,
      system: this.defaultSettings.system,
      about: this.defaultSettings.about,
    };
  }

  async updateSettings(section: string, data: unknown): Promise<AdminSettings> {
    const validSections = ['general', 'security', 'notifications', 'appearance', 'ai'];
    if (!validSections.includes(section)) {
      throw new Error(`Invalid settings section: ${section}`);
    }

    const current = await this.loadSection<Record<string, unknown>>(
      section,
      this.defaultSettings[section as keyof AdminSettings] as unknown as Record<string, unknown>,
    );
    const merged = { ...current, ...(data as Record<string, unknown>) };

    await this.prisma.systemSetting.upsert({
      where: { key: this.getSectionKey(section) },
      update: {
        value: JSON.stringify(merged),
        updatedAt: new Date(),
      },
      create: {
        key: this.getSectionKey(section),
        value: JSON.stringify(merged),
        description: `${section} settings`,
      },
    });

    return this.getSettings();
  }

  async getSystemInfo() {
    return this.defaultSettings.system;
  }

  async getAboutInfo() {
    return this.defaultSettings.about;
  }
}
