import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Time range for analytics data',
    enum: ['today', '7d', '30d', '90d', '1y'],
    default: '30d',
  })
  @IsEnum(['today', '7d', '30d', '90d', '1y'] as const)
  @IsOptional()
  range?: 'today' | '7d' | '30d' | '90d' | '1y';
}

export class ExportQueryDto {
  @ApiPropertyOptional({
    description: 'Export format',
    enum: ['csv', 'json'],
    default: 'csv',
  })
  @IsEnum(['csv', 'json'] as const)
  @IsOptional()
  format?: 'csv' | 'json';
}
