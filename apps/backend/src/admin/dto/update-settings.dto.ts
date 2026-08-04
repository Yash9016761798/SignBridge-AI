import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';

export class GeneralSettingsUpdateDto {
  @ApiPropertyOptional({ example: 'SignBridge AI' })
  @IsString()
  @IsOptional()
  platformName?: string;

  @ApiPropertyOptional({ example: 'SignBridge Foundation' })
  @IsString()
  @IsOptional()
  organization?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @IsOptional()
  defaultLanguage?: string;

  @ApiPropertyOptional({ example: 'Asia/Kolkata' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 'DD/MM/YYYY' })
  @IsString()
  @IsOptional()
  dateFormat?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string | null;
}

export class SecuritySettingsUpdateDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  firebaseEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  jwtEnabled?: boolean;

  @ApiPropertyOptional({ example: 'Minimum 8 characters, 1 uppercase, 1 number' })
  @IsString()
  @IsOptional()
  passwordPolicy?: string;

  @ApiPropertyOptional({ example: 60 })
  @IsNumber()
  @Min(5)
  @Max(480)
  @IsOptional()
  sessionTimeout?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  registrationEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['LEARNER', 'TEACHER', 'HOSPITAL', 'NGO', 'GOVERNMENT', 'ADMIN'] })
  @IsEnum(['LEARNER', 'TEACHER', 'HOSPITAL', 'NGO', 'GOVERNMENT', 'ADMIN'] as const)
  @IsOptional()
  defaultUserRole?: string;
}

export class NotificationSettingsUpdateDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  smsNotifications?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  systemAlerts?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  aiAlerts?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  maintenanceAlerts?: boolean;
}

export class AppearanceSettingsUpdateDto {
  @ApiPropertyOptional({ enum: ['light', 'dark', 'system'] })
  @IsEnum(['light', 'dark', 'system'] as const)
  @IsOptional()
  theme?: 'light' | 'dark' | 'system';

  @ApiPropertyOptional({ example: '#E9A8C9' })
  @IsString()
  @IsOptional()
  accentColor?: string;

  @ApiPropertyOptional({ enum: ['default', 'compact', 'minimal'] })
  @IsEnum(['default', 'compact', 'minimal'] as const)
  @IsOptional()
  sidebarStyle?: 'default' | 'compact' | 'minimal';

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  compactMode?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  animations?: boolean;
}

export class AiSettingsUpdateDto {
  @ApiPropertyOptional({ example: 'PoseTransformer' })
  @IsString()
  @IsOptional()
  currentModel?: string;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsString()
  @IsOptional()
  modelVersion?: string;

  @ApiPropertyOptional({ example: 0.7 })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  confidenceThreshold?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  predictionTimeout?: number;

  @ApiPropertyOptional({ example: 'Demo' })
  @IsString()
  @IsOptional()
  inferenceMode?: string;

  @ApiPropertyOptional({ example: 'CPU' })
  @IsString()
  @IsOptional()
  device?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  autoReloadModel?: boolean;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: ['general', 'security', 'notifications', 'appearance', 'ai'] })
  @IsString()
  @IsOptional()
  section?: string;

  @ApiPropertyOptional()
  @IsOptional()
  general?: GeneralSettingsUpdateDto;

  @ApiPropertyOptional()
  @IsOptional()
  security?: SecuritySettingsUpdateDto;

  @ApiPropertyOptional()
  @IsOptional()
  notifications?: NotificationSettingsUpdateDto;

  @ApiPropertyOptional()
  @IsOptional()
  appearance?: AppearanceSettingsUpdateDto;

  @ApiPropertyOptional()
  @IsOptional()
  ai?: AiSettingsUpdateDto;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  data?: Record<string, unknown>;
}
