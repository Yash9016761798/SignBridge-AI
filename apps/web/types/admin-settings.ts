export type SettingsTab = 'general' | 'security' | 'notifications' | 'appearance' | 'ai' | 'system' | 'about';

export interface GeneralSettings {
  platformName: string;
  organization: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  logoUrl: string | null;
}

export interface SecuritySettings {
  firebaseEnabled: boolean;
  jwtEnabled: boolean;
  passwordPolicy: string;
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  rolePermissions: { role: string; permissions: string[] }[];
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  systemAlerts: boolean;
  aiAlerts: boolean;
  maintenanceAlerts: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  sidebarStyle: 'default' | 'compact' | 'minimal';
  compactMode: boolean;
  animations: boolean;
}

export interface AiConfigSettings {
  currentModel: string;
  modelVersion: string;
  confidenceThreshold: number;
  predictionTimeout: number;
  inferenceMode: string;
  device: string;
  autoReloadModel: boolean;
}

export interface SystemInfo {
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

export interface AboutInfo {
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
  ai: AiConfigSettings;
  system: SystemInfo;
  about: AboutInfo;
}
